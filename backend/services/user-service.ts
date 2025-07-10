import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";
import { User, Prisma, Attachment, TicketPriority, Ticket } from "@prisma/client";
import { type CreateTicketData, type UpdateEmployeeData } from "../controllers/user-controller";
import { geminiService } from "./gemini-service";
import * as fs from 'fs';
import * as path from 'path';

interface QueueHistoryParams {
    start_date?: string;
    end_date?: string;
}

// User service
// Handles: user profile operations, queue participation logic
export const userService = {
    /**
     * Update user profile
     * @param user_id - The user ID
     * @param updateData - The data to update
     */
    async updateUserProfile(user_id: string, updateData: Partial<User>) {
        const user = await prisma.user.update({
            where: { user_id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
        });
        return { user };
    },

    
    /**
     * Get user by ID
     * @param userId - The user ID
     */
    async getUserById(userId: string) {

        const result = await prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                select: {
                    user_id: true,
                    username: true,
                    email: true,
                    fname: true,
                    lname: true,
                    phone: true,
                    role: true,
                    status: true,
                    lang: true,
                    email_verified: true,
                    created_at: true,
                    updated_at: true,
                    last_login: true,
                    UserAdmin: {
                        select: {
                            admin_id: true,
                            role: true,
                            position: true,
                        }
                    },
                    UserMerchant: {
                        select: {
                            staff_id: true,
                            merchant_id: true,
                            role: true,
                            position: true,
                            selected_branch_id: true,
                            UserMerchantOnBranch: {
                                select: {
                                    branch_id: true,
                                    Branch: {
                                        select: {
                                            branch_id: true,
                                            branch_name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Avatar: {
                        select: {
                            image_id: true,
                            image_url: true,
                        }
                    },
                },
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return { user };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Get employees
     * @param merchant_id - The merchant ID
     */
    async getEmployees(merchant_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const employees = await tx.userMerchant.findMany({
                where: { merchant_id },
                include: {
                    User: {
                        select: {
                            user_id: true,
                            username: true,
                            fname: true,
                            lname: true,
                            email: true,
                            phone: true,
                            role: true,
                            status: true,
                            last_login: true,
                            Avatar: {
                                select: {
                                    image_url: true
                                }
                            }
                        }
                    },
                    UserMerchantOnBranch: {
                        include: {
                            Branch: {
                                select: {
                                    branch_id: true,
                                    branch_name: true
                                }
                            }
                        }
                    }
                }
            });

            return employees;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;  
    },

    /**
     * Assign branches to employee
     * @param staffId - The staff ID
     * @param branchIds - The branch IDs
     */
    async assignBranches(staffId: string, branchIds: string[]) {
        return prisma.$transaction(async (tx) => {
            // Delete existing assignments for the staff member
            await tx.userMerchantOnBranch.deleteMany({
                where: {
                    staff_id: staffId,
                },
            });

            // If there are new branches to assign, create them
            if (branchIds && branchIds.length > 0) {
                // Ensure the user merchant exists
                const userMerchant = await tx.userMerchant.findUnique({
                    where: { staff_id: staffId },
                    select: { staff_id: true }
                });

                if (!userMerchant) {
                    throw new AppError("User merchant not found", 404);
                }

                // Verify that all branch IDs exist
                const branches = await tx.branch.findMany({
                    where: { branch_id: { in: branchIds } },
                    select: { branch_id: true }
                });

                if (branches.length !== branchIds.length) {
                    const foundBranchIds = branches.map(b => b.branch_id);
                    const notFound = branchIds.filter(id => !foundBranchIds.includes(id));
                    throw new AppError(`The following branches were not found: ${notFound.join(', ')}`, 404);
                }

                // Create new assignments
                const newAssignments = branchIds.map((branchId) => ({
                    staff_id: staffId,
                    branch_id: branchId,
                }));

                await tx.userMerchantOnBranch.createMany({
                    data: newAssignments,
                });
            }

            return { success: true };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    },

    /**
     * Update employee
     * @param staffId - The staff ID
     * @param updateData - The update data
     */
    async updateEmployee(staffId: string, updateData: UpdateEmployeeData) {
        const result = await prisma.$transaction(async (tx) => {
            const userMerchant = await tx.userMerchant.findUnique({
                where: { staff_id: staffId },
            });

            if (!userMerchant) {
                throw new AppError("User merchant not found", 404);
            }

            // Prepare data for User and UserMerchant updates
            const userData: Prisma.UserUpdateInput = {};
            if (updateData.fname) userData.fname = updateData.fname;
            if (updateData.lname) userData.lname = updateData.lname;
            if (updateData.phone) userData.phone = updateData.phone;

            const userMerchantData: Prisma.UserMerchantUpdateInput = {};
            if (updateData.position) userMerchantData.position = updateData.position;
            if (updateData.role) userMerchantData.role = updateData.role;

            // Update User record if there's data for it
            if (Object.keys(userData).length > 0) {
                userData.updated_at = new Date();
                await tx.user.update({
                    where: { user_id: userMerchant.user_id },
                    data: userData,
                });
            }

            // Update UserMerchant record if there's data for it
            if (Object.keys(userMerchantData).length > 0) {
                userMerchantData.updated_at = new Date();
                await tx.userMerchant.update({
                    where: { staff_id: staffId },
                    data: userMerchantData
                });
            }

            // Return the fully updated employee record
            return tx.userMerchant.findUnique({
                where: { staff_id: staffId },
                include: {
                    User: {
                        select: {
                            user_id: true,
                            username: true,
                            fname: true,
                            lname: true,
                            email: true,
                            phone: true,
                            role: true,
                            status: true,
                            last_login: true,
                            Avatar: {
                                select: {
                                    image_url: true
                                }
                            }
                        }
                    },
                    UserMerchantOnBranch: {
                        include: {
                            Branch: {
                                select: {
                                    branch_id: true,
                                    branch_name: true
                                }
                            }
                        }
                    }
                }
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },

    /**
     * Delete employee
     */
    async deleteEmployee(user_id: string) {
        const user = await prisma.user.findUnique({
            where: { user_id },
            include: { Avatar: true },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }
        const avatarUrl = user.Avatar?.image_url;

        const transactionResult = await prisma.$transaction(async (tx) => {
            const userMerchantToDelete = await tx.userMerchant.findUnique({
                where: { user_id: user_id },
            });

            if (!userMerchantToDelete) {
                throw new AppError("Employee not found", 404);
            }

            if (userMerchantToDelete.role === 'OWNER') {
                throw new AppError("Cannot delete the owner of the merchant.", 403);
            }

            const { staff_id, merchant_id } = userMerchantToDelete;

            const affectedBranches = await tx.branch.findMany({
                where: {
                    merchant_id: merchant_id,
                    contact_person_id: staff_id,
                },
            });

            if (affectedBranches.length > 0) {
                const owner = await tx.userMerchant.findFirst({
                    where: {
                        merchant_id: merchant_id,
                        role: 'OWNER',
                    },
                });

                if (!owner) {
                    throw new AppError("Merchant owner not found to reassign contact person.", 500);
                }

                await tx.branch.updateMany({
                    where: {
                        branch_id: { in: affectedBranches.map(b => b.branch_id) }
                    },
                    data: {
                        contact_person_id: owner.staff_id,
                    },
                });
            }
            
            const deletedUser = await tx.user.delete({
                where: { user_id },
            });

            return deletedUser;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (avatarUrl) {
            const filePath = path.join(process.cwd(), '..', 'frontend', 'public', avatarUrl);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete avatar file: ${err.message}`);
                }
            });
        }

        return transactionResult;
    },

    /**
     * Upload avatar
     * @param user_id - The user ID
     * @param image_url - The image URL
     */
    async uploadAvatar(user_id: string, image_url: string) {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { user_id },
                include: {
                    Avatar: true
                }
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (user.Avatar) {
                const filePath = path.join(process.cwd(), '..', 'frontend', 'public', user.Avatar.image_url);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete avatar file: ${err.message}`);
                    }
                });
            }

            const updatedUser = await tx.user.update({
                where: { user_id },
                data: {
                    Avatar: {
                        create: {
                            image_url: image_url
                        }
                    }
                }
            });

            return updatedUser;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    async deleteAvatar(user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { user_id },
                include: {
                    Avatar: true
                }
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (user.Avatar) {

                // Delete the avatar record from database
                await tx.avatar.delete({
                    where: { image_id: user.Avatar.image_id }
                });

                // Delete the avatar file
                const filePath = path.join(process.cwd(), 'public', user.Avatar.image_url);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete avatar file: ${err.message}`);
                    }
                });

            }

            return { success: true };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Join a queue
     * @param queue_id - The queue ID
     * @param user_id - The user ID
     */
    async joinQueue(queue_id: string, user_id: string) {
        // Get the last queue entry number
        const lastEntry = await prisma.queueEntry.findFirst({
            where: { queue_id },
            orderBy: { number: 'desc' },
        });

        const nextNumber = (lastEntry?.number ?? 0) + 1;

        // Create new queue entry
        const entry = await prisma.queueEntry.create({
            data: {
                queue_id,
                user_id,
                number: nextNumber,
                status: "WAITING",
                updated_at: new Date(),
            },
        });

        return { entry };
    },

    /**
     * Leave a queue
     * @param queue_id - The queue ID
     * @param user_id - The user ID
     */
    async leaveQueue(queue_id: string, user_id: string) {
        // Find the user's active queue entry
        const entry = await prisma.queueEntry.findFirst({
            where: {
                queue_id,
                user_id,
                status: "WAITING",
            },
        });

        if (!entry) {
            throw new AppError("No active queue entry found", 404);
        }

        // Update entry status to NO_SHOW
        const updatedEntry = await prisma.queueEntry.update({
            where: { entry_id: entry.entry_id },
            data: {
                status: "NO_SHOW",
                updated_at: new Date(),
            },
        });

        return { entry: updatedEntry };
    },

    /**
     * Get user's queue history
     * @param user_id - The user ID
     * @param params - The history parameters
     */
    async getQueueHistory(user_id: string, params: QueueHistoryParams) {
        const { start_date, end_date } = params;
        
        const entries = await prisma.queueEntry.findMany({
            where: {
                user_id,
                join_at: {
                    gte: start_date ? new Date(start_date) : undefined,
                    lte: end_date ? new Date(end_date) : undefined,
                },
            },
            include: {
                Queue: {
                    include: {
                        Branch: {
                            include: {
                                Merchant: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                join_at: 'desc',
            },
        });

        return { entries };
    },

    /**
     * Create a ticket
     * @param user_id - The user ID
     * @param subject - The ticket subject
     * @param category - The ticket category
     * @param message - The ticket message
     * @param files - The ticket files
     */
    async createTicket(user_id: string, data: CreateTicketData) {
        // NOTE: Ensure the route/controller uses uploadTicketFiles multer middleware so req.files is populated
        let uploadedFilePaths: string[] = [];
        try {
            const result = await prisma.$transaction(async (tx) => {
                const ticket = await tx.ticket.create({
                    data: {
                        user_id,
                        subject: data.subject,
                        category: data.category,
                        content: data.message,
                        priority: data.priority,
                        status: "OPEN",
                    },
                });

                // Create attachments
                if (data.files && data.files.length > 0) {
                    for (const file of data.files) {
                        // Ensure file has the required properties
                        const multerFile = file as any;
                        const fileUrl = `/uploads/${multerFile.filename}`;
                        uploadedFilePaths.push(path.join(process.cwd(), 'public', 'uploads', multerFile.filename));
                        await tx.attachment.create({
                            data: {
                                ticket_id: ticket.ticket_id,
                                file_url: fileUrl,
                            },
                        });
                    }
                }

                return ticket;
            }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

            return result;
        } catch (err) {
            // On error, remove uploaded files
            for (const filePath of uploadedFilePaths) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete attachment file: ${err.message}`);
                    }
                });
            }
            throw err;
        }
    },

    /**
     * Get tickets
     * @param user_id - The user ID (for admin users, this can be used to get all tickets)
     * @param status - Optional status filter (can be array for multiple statuses)
     * @param isAdmin - Whether the user is an admin (if true, gets all tickets)
     */
    async getTickets(user_id: string, status?: string | string[], isAdmin: boolean = false) {
        const whereClause: any = {};
        
        // For non-admin users, only show their own tickets
        if (!isAdmin) {
            whereClause.user_id = user_id;
        }
        
        // Handle status filtering
        if (status) {
            if (Array.isArray(status)) {
                whereClause.status = { in: status };
            } else {
                whereClause.status = status;
            }
        }

        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: {
                Attachment: {
                    select: {
                        attachment_id: true,
                        file_url: true,
                        created_at: true,
                    }
                },
                User: {
                    select: {
                        user_id: true,
                        fname: true,
                        lname: true,
                        email: true,
                        role: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return { tickets };
    },

    /**
     * Get a specific ticket
     * @param user_id - The user ID
     * @param ticket_id - The ticket ID
     */
    async getTicket(ticket_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            console.log(ticket_id);
            const ticket = await tx.ticket.findFirst({
                where: { 
                    ticket_id
                },
                include: {
                    Attachment: {
                        select: {
                            attachment_id: true,
                            file_url: true,
                            created_at: true,
                        }
                    },
                    User: {
                        select: {
                            user_id: true,
                            username: true,
                            fname: true,
                            lname: true,
                        }
                    }
                },
            });

            if (!ticket) {
                throw new AppError("Ticket not found", 404);
            }

            return { ticket };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Update ticket
     * @param ticket_id - The ticket ID
     * @param data - The update data
     */
    async updateTicket(ticket_id: string, data: Partial<Ticket>) {
        const result = await prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.update({
                where: { ticket_id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
            });

            return { ticket };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },
}; 