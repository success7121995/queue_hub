import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { Branch, MerchantRole, Prisma, Queue, Tag, TagEntity, User } from "@prisma/client";
import { BranchSchema, BranchImageSchema, AddressSchema, BranchFeatureSchema, BranchTagSchema } from "../controllers/merchant-controller";

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
     * Get user merchants
     * @param merchant_id - The merchant ID
     * @returns 
     */
    async getUserMerchants(merchant_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const userMerchants = await tx.userMerchant.findMany({
                where: {
                    merchant_id,
                },
                include: {
                    User: true,
                }
            });
            
            const branches = await tx.branch.findMany({
                where: {
                    merchant_id,
                },
            });
            
            return { user_merchants: userMerchants };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to get user merchants", 500);
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
    async createQueue (branch_id: string, queue_name: string, tags?: string) {
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
                    entity_type: TagEntity.QUEUE,
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
                    entity_type: TagEntity.QUEUE,
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
    async getBranchesByMerchantId(merchant_id: string, prefetch: boolean = false) {
        const result = await prisma.$transaction(async (tx) => {
            let branches: Partial<Branch>[] = [];
            
            if (prefetch) {
                branches = await tx.branch.findMany({
                    where: { merchant_id },
                    select: {
                        branch_id: true,
                        branch_name: true,
                    },
                });

                return { branches };
            } else {
                branches = await tx.branch.findMany({
                    where: { merchant_id },
                    include: {
                        BranchFeature: true,
                        BranchImage: true,
                        BranchOpeningHour: true,
                        Address: true,
                        UserMerchantOnBranch: true,
                    },
                });

                const contactPersonIds = branches
                    .map(branch => branch.contact_person_id)
                    .filter((id): id is string => !!id);

                const tags = await tx.tag.findMany({
                    where: {
                        entity_type: TagEntity.BRANCH,
                        entity_id: { in: branches.map(branch => branch.branch_id).filter((id): id is string => !!id) },
                    },
                });

                // Group tags by entity_id (branch_id)
                const tagsByBranch = tags.reduce((acc, tag) => {
                    if (!acc[tag.entity_id]) {
                        acc[tag.entity_id] = [];
                    }
                    acc[tag.entity_id].push(tag);
                    return acc;
                }, {} as Record<string, any[]>);

                let contact_person_map: Record<string, any> = {};
        
                if (contactPersonIds.length > 0) {
                    const contact_persons = await tx.userMerchant.findMany({
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
                    }, {} as Record<string, any>);
                }
        
                // 補上 contact_person and tags
                const branchesWithContactPerson = branches.map(branch => ({
                    ...branch,
                    contact_person: contact_person_map[branch.contact_person_id ?? ""] ?? null,
                    Tag: tagsByBranch[branch.branch_id as string] || [],
                }));
        
                return { branches: branchesWithContactPerson };
            }
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to get branches", 500);
        }
    
        return result;
    },

    /**
     * Update branch data
     * @param branch_id 
     * @param data 
     * @returns 
     */
    async updateBranch(branch_id: string, data: Partial<BranchSchema>) {
        const result = await prisma.$transaction(async (tx) => {
            const branch = await tx.branch.update({
                where: { branch_id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
            });

            return { branch };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (!result) {
            throw new AppError("Failed to update branch", 500);
        }

        return result;
    },

    /**
     * Update branch address
     * @param branch_id 
     * @param data 
     * @returns 
     */
    async updateBranchAddress(branch_id: string, data: Partial<AddressSchema>) {
        const result = await prisma.$transaction(async (tx) => {
            // First, find the address associated with this branch
            const existingAddress = await tx.address.findFirst({
                where: { branch_id },
            });

            if (!existingAddress) {
                throw new AppError("No address found for this branch", 404);
            }

            // Update the address
            const address = await tx.address.update({
                where: { address_id: existingAddress.address_id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
            });

            return { address };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        if (!result) {
            throw new AppError("Failed to update branch address", 500);
        }

        return result;
    },

    /**
     * Update branch images (Logo, Feature Image, Galleries)
     * @param branch_id 
     * @param data 
     */
    async updateBranchImages(branch_id: string, data: BranchImageSchema) {},

    /**
     * Create a new branch feature
     * @param branch_id 
     * @param feature_name 
     * @returns 
     */
    async createBranchFeature(branch_id: string, feature_name: string) {
        const result = await prisma.$transaction(async (tx) => {
            const feature = await tx.branchFeature.create({
                data: {
                    branch_id,
                    feature_id: uuidv4(),
                    label: feature_name,
                    is_positive: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
    
            return { feature };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to create branch feature", 500);
        }

        return result;
    },

    /**
     * Delete a branch feature
     * @param feature_id 
     * @returns 
     */
    async deleteBranchFeature(feature_id: string) {  
        const result = await prisma.$transaction(async (tx) => {
            const feature = await tx.branchFeature.delete({
                where: { feature_id },
            });
            return { feature };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });  

        if (!result) {
            throw new AppError("Failed to delete branch feature", 500);
        }

        return result;
    },

    /**
     * Create a new branch tag
     * @param branch_id 
     * @param tag_name 
     * @returns 
     */
    async createBranchTag(branch_id: string, tag_name: string) {
        const result = await prisma.$transaction(async (tx) => {
            const tag = await tx.tag.create({
                data: {
                    entity_id: branch_id,
                    entity_type: TagEntity.BRANCH,
                    tag_id: uuidv4(),
                    tag_name: tag_name,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return { tag }; 
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to create branch tag", 500);
        }

        return result;
    },

    /**
     * Delete a branch tag
     * @param branch_id 
     * @param tag_id 
     * @returns 
     */
    async deleteBranchTag(tag_id: string) {  
        const result = await prisma.$transaction(async (tx) => {
            const tag = await tx.tag.delete({
                where: { tag_id },
            });
            return { tag };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }); 

        if (!result) {
            throw new AppError("Failed to delete branch tag", 500);
        }

        return result;
    },

    /**
     * Update branch opening hours
     */

    /**
     * Update branch contact person
     */

    /** */
}; 