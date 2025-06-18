import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { MerchantRole, Prisma, Queue, Tag, User } from "@prisma/client";
import { BranchSchema } from "../controllers/merchant-controller";

interface QueueAnalyticsParams {
    start_date?: string;
    end_date?: string;
}

// Merchant service
// Handles: queue management, customer operations, merchant analytics
export const merchantService = {

    /**
     * Get merchant by id
     * @param merchant_id - The merchant ID
     * @returns The merchant
     */
    async getMerchantById(merchant_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.findUnique({
                where: { merchant_id },
            });

            if (!merchant) {
                throw new AppError("Merchant not found", 404);
            }

            return { merchant };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to get merchant", 500);
        }

        return result;
    },

    /**
     * Update merchant profile
     * @param merchant_id - The merchant ID
     * @param updateData - The data to update
     */
    async updateMerchantProfile(merchant_id: string, updateData: any) {

        const result = await prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({
                where: { merchant_id },
                data: {
                    ...updateData,
                    updated_at: new Date(),
                },
            });

            return { merchant };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (!result) {
            throw new AppError("Failed to update merchant profile", 500);
        }

        return result;
    },

    /**
     * Create a new queue
     * @param queue - The queue object
     * @param tags - The tags to create
     * @returns The created queue and tags
     */
    createQueue: async (branch_id: string, queue_name: string, tags?: string) => {
        const result = await prisma.$transaction(async (tx) => {
            const newQueue = await tx.queue.create({
                data: {
                    queue_id: uuidv4(),
                    queue_name,
                    branch_id,
                    updated_at: new Date(),
                },
            });

            if (!newQueue || !newQueue.queue_id) {
                throw new AppError("Failed to create queue", 500);
            }

            if (tags) {
                const tagData = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
                    tag_id: uuidv4(),
                    entity_id: newQueue.queue_id,
                    branch_id,
                    tag_name: tag,
                    updated_at: new Date()
                }));
                
                const newTags = await tx.tag.createMany({
                    data: tagData,
                });

                if (!newTags || newTags.count !== tagData.length) {
                    throw new AppError("Failed to create tags", 500);
                }

                const fetchedTags = await tx.tag.findMany({
                    where: {
                        entity_id: newQueue.queue_id,
                    },
                });

                if (!fetchedTags || fetchedTags.length !== tagData.length) {
                    throw new AppError("Failed to fetch tags", 500);
                }

                return { queue: newQueue, tags: fetchedTags };
            }

            return { queue: newQueue };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },


    /**
     * Update queue details
     * @param queue_id - The queue ID
     * @param updateData - The data to update
     */
    async updateQueue(queue_id: string, queue_name: string, tags: string) {
        const result = await prisma.$transaction(async (tx) => {
            let queue = await tx.queue.findUnique({
                where: { queue_id },
            });
    
            if (!queue) {
                throw new AppError("Queue not found", 404);
            }
    
            if (queue_name) {
                queue = await tx.queue.update({
                    where: { queue_id },
                    data: {
                        queue_name: queue_name,
                        updated_at: new Date(),
                    },
                });
            }
    
            let tagRecords: Tag[] = [];
            
            if (tags) {
                // Delete existing tags for this queue
                await tx.tag.deleteMany({
                    where: { entity_id: queue_id },
                });

                // Generate tag data
                const tagData = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
                    tag_id: uuidv4(),
                    entity_id: queue.queue_id,
                    branch_id: queue.branch_id!,
                    tag_name: tag,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));

                // Bulk insert
                const createResult = await tx.tag.createMany({
                    data: tagData,
                    skipDuplicates: false,
                });

                if (!createResult || createResult.count !== tagData.length) {
                    throw new AppError("Failed to create all tags", 500);
                }

                // Retrieve full tag records
                tagRecords = await tx.tag.findMany({
                    where: {
                        entity_id: queue.queue_id,
                        tag_name: { in: tags.split(',').map(tag => tag.trim()).filter(Boolean) },
                        branch_id: queue.branch_id!,
                    },
                });
            } else {
                await tx.tag.deleteMany({
                    where: { entity_id: queue_id },
                });

                tagRecords = [];
            }
    
            return { queue, tags: tagRecords };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
    
        if (!result) {
            throw new AppError("Failed to update queue", 500);
        }

        return result;
    },

    /**
     * Open or close a queue
     * @param queue_id - The queue ID
     * @param status - The status to set
     */
    async openOrCloseQueue(queue_id: string, status: "OPEN" | "CLOSED") {
        const result = await prisma.$transaction(async (tx) => {
            const queue = await tx.queue.update({
                where: { queue_id },
                data: { queue_status: status },
            });
            return { queue };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (!result) {
            throw new AppError("Failed to open or close queue", 500);
        }

        return result;
    },

    /**
     * Delete a queue
     * @param queue_id - The queue ID
     */
    async deleteQueue(queue_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const queue = await tx.queue.delete({
                where: { queue_id },
            });
            return { queue };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (!result) {
            throw new AppError("Failed to delete queue", 500);
        }

        return result;
    },

    /**
     * Get queue analytics
     * @param queue_id - The queue ID
     * @param params - The analytics parameters
     */
    async getQueueAnalytics(queue_id: string, params: QueueAnalyticsParams) {
        const { start_date, end_date } = params;
        
        // Get queue entries within date range
        const entries = await prisma.queueEntry.findMany({
            where: {
                queue_id,
                join_at: {
                    gte: start_date ? new Date(start_date) : undefined,
                    lte: end_date ? new Date(end_date) : undefined,
                },
            },
            include: {
                User: true,
            },
        });

        // Calculate analytics
        const total_entries = entries.length;
        const completed_entries = entries.filter(e => e.status === "DONE").length;
        const no_shows = entries.filter(e => e.status === "NO_SHOW").length;
        const avg_wait_time = entries.reduce((acc, entry) => {
            if (entry.served_at && entry.join_at) {
                return acc + (entry.served_at.getTime() - entry.join_at.getTime());
            }
            return acc;
        }, 0) / (completed_entries || 1);

        return {
            total_entries,
            completed_entries,
            no_shows,
            avg_wait_time: Math.round(avg_wait_time / 1000 / 60), // Convert to minutes
        };
    },

    /**
     * Create a new branch
     * @param branch_name - The branch name
     * @param branch_address - The branch address
     * @param branch_phone - The branch phone
     * @param branch_email - The branch email
     * @param branch_website - The branch website
     */
    async createBranch(data: BranchSchema) {
        const result = await prisma.$transaction(async (tx) => {
        });

        return result;
    },

    /**
     * Get branches by merchant id
     * @param merchant_id 
     * @returns 
     */
    async getBranchesByMerchantId(merchant_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const branches = await tx.branch.findMany({
                where: { merchant_id },
                include: {
                    BranchFeature: true,
                    BranchImage: true,
                    BranchOpeningHour: true,
                    Address: true,
                    UserMerchantOnBranch: true,
                }
            });

            // Get all contact person IDs from branches, filtering out null/undefined values
            const contactPersonIds = branches
                .map(branch => branch.contact_person_id)
                .filter(id => id !== null && id !== undefined);

            let contact_persons: any[] = [];
            let contact_person_map: Record<string, any> = {};

            if (contactPersonIds.length > 0) {
                contact_persons = await tx.userMerchant.findMany({
                    where: { 
                        staff_id: { in: contactPersonIds }
                    },
                    select: {
                        staff_id: true,
                        user_id: true,
                        role: true,
                        position: true,
                        User: { 
                            select: { 
                                lname: true, 
                                fname: true, 
                                email: true, 
                                phone: true 
                            } 
                        },
                    },
                });

                contact_person_map = contact_persons.reduce((acc, user) => {
                    acc[user.staff_id] = user;
                    return acc;
                }, {} as Record<string, {
                    staff_id: string;
                    user_id: string;
                    role: MerchantRole;
                    position: string;
                    User: { lname: string; fname: string; email: string; phone: string } | null;
                }>);
            }

            const branchesWithContactPerson = branches.map(branch => ({
                ...branch,
                contact_person: contact_person_map[branch.contact_person_id] ?? null,
            }));

            return { branches: branchesWithContactPerson };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to get branches", 500);
        }

        return result;
    },
}; 