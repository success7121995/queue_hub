"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../lib/prisma");
const app_error_1 = require("../utils/app-error");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.userService = {
    async updateUserProfile(user_id, updateData) {
        const user = await prisma_1.prisma.user.update({
            where: { user_id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
        });
        return { user };
    },
    async getUserById(userId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await prisma_1.prisma.user.findUnique({
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
                throw new app_error_1.AppError("User not found", 404);
            }
            return { user };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async getEmployees(merchant_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async assignBranches(staffId, branchIds) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.userMerchantOnBranch.deleteMany({
                where: {
                    staff_id: staffId,
                },
            });
            if (branchIds && branchIds.length > 0) {
                const userMerchant = await tx.userMerchant.findUnique({
                    where: { staff_id: staffId },
                    select: { staff_id: true }
                });
                if (!userMerchant) {
                    throw new app_error_1.AppError("User merchant not found", 404);
                }
                const branches = await tx.branch.findMany({
                    where: { branch_id: { in: branchIds } },
                    select: { branch_id: true }
                });
                if (branches.length !== branchIds.length) {
                    const foundBranchIds = branches.map(b => b.branch_id);
                    const notFound = branchIds.filter(id => !foundBranchIds.includes(id));
                    throw new app_error_1.AppError(`The following branches were not found: ${notFound.join(', ')}`, 404);
                }
                const newAssignments = branchIds.map((branchId) => ({
                    staff_id: staffId,
                    branch_id: branchId,
                }));
                await tx.userMerchantOnBranch.createMany({
                    data: newAssignments,
                });
            }
            return { success: true };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
    },
    async updateEmployee(staffId, updateData) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const userMerchant = await tx.userMerchant.findUnique({
                where: { staff_id: staffId },
            });
            if (!userMerchant) {
                throw new app_error_1.AppError("User merchant not found", 404);
            }
            const userData = {};
            if (updateData.fname)
                userData.fname = updateData.fname;
            if (updateData.lname)
                userData.lname = updateData.lname;
            if (updateData.phone)
                userData.phone = updateData.phone;
            const userMerchantData = {};
            if (updateData.position)
                userMerchantData.position = updateData.position;
            if (updateData.role)
                userMerchantData.role = updateData.role;
            if (Object.keys(userData).length > 0) {
                userData.updated_at = new Date();
                await tx.user.update({
                    where: { user_id: userMerchant.user_id },
                    data: userData,
                });
            }
            if (Object.keys(userMerchantData).length > 0) {
                userMerchantData.updated_at = new Date();
                await tx.userMerchant.update({
                    where: { staff_id: staffId },
                    data: userMerchantData
                });
            }
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    async deleteEmployee(user_id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { user_id },
            include: { Avatar: true },
        });
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const avatarUrl = user.Avatar?.image_url;
        const transactionResult = await prisma_1.prisma.$transaction(async (tx) => {
            const userMerchantToDelete = await tx.userMerchant.findUnique({
                where: { user_id: user_id },
            });
            if (!userMerchantToDelete) {
                throw new app_error_1.AppError("Employee not found", 404);
            }
            if (userMerchantToDelete.role === 'OWNER') {
                throw new app_error_1.AppError("Cannot delete the owner of the merchant.", 403);
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
                    throw new app_error_1.AppError("Merchant owner not found to reassign contact person.", 500);
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
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
    async uploadAvatar(user_id, image_url) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { user_id },
                include: {
                    Avatar: true
                }
            });
            if (!user) {
                throw new app_error_1.AppError("User not found", 404);
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async deleteAvatar(user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { user_id },
                include: {
                    Avatar: true
                }
            });
            if (!user) {
                throw new app_error_1.AppError("User not found", 404);
            }
            if (user.Avatar) {
                await tx.avatar.delete({
                    where: { image_id: user.Avatar.image_id }
                });
                const filePath = path.join(process.cwd(), 'public', user.Avatar.image_url);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete avatar file: ${err.message}`);
                    }
                });
            }
            return { success: true };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async joinQueue(queue_id, user_id) {
        const lastEntry = await prisma_1.prisma.queueEntry.findFirst({
            where: { queue_id },
            orderBy: { number: 'desc' },
        });
        const nextNumber = (lastEntry?.number ?? 0) + 1;
        const entry = await prisma_1.prisma.queueEntry.create({
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
    async leaveQueue(queue_id, user_id) {
        const entry = await prisma_1.prisma.queueEntry.findFirst({
            where: {
                queue_id,
                user_id,
                status: "WAITING",
            },
        });
        if (!entry) {
            throw new app_error_1.AppError("No active queue entry found", 404);
        }
        const updatedEntry = await prisma_1.prisma.queueEntry.update({
            where: { entry_id: entry.entry_id },
            data: {
                status: "NO_SHOW",
                updated_at: new Date(),
            },
        });
        return { entry: updatedEntry };
    },
    async getQueueHistory(user_id, params) {
        const { start_date, end_date } = params;
        const entries = await prisma_1.prisma.queueEntry.findMany({
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
    async createTicket(user_id, data) {
        let uploadedFilePaths = [];
        try {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
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
                if (data.files && data.files.length > 0) {
                    for (const file of data.files) {
                        const multerFile = file;
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
            }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
            return result;
        }
        catch (err) {
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
    async getTickets(user_id, status, isAdmin = false) {
        const whereClause = {};
        if (!isAdmin) {
            whereClause.user_id = user_id;
        }
        if (status) {
            if (Array.isArray(status)) {
                whereClause.status = { in: status };
            }
            else {
                whereClause.status = status;
            }
        }
        const tickets = await prisma_1.prisma.ticket.findMany({
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
    async getTicket(ticket_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
                throw new app_error_1.AppError("Ticket not found", 404);
            }
            return { ticket };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async updateTicket(ticket_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.update({
                where: { ticket_id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
            });
            return { ticket };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
};
