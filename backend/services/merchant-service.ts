import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { Branch, MerchantRole, Prisma, Queue, Tag, TagEntity, User, ImageType } from "@prisma/client";
import { BranchSchema, BranchImageSchema, AddressSchema, BranchFeatureSchema, BranchTagSchema, BranchOpeningHourSchema } from "../controllers/merchant-controller";
import fs from "fs";
import path from "path";

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
     * @param data - The branch data
     * @returns The created branch
     */
    async createBranch(data: BranchSchema & { merchant_id: string } & { address?: AddressSchema }) {
        const result = await prisma.$transaction(async (tx) => {
            const branch = await tx.branch.create({
                data: {
                    branch_id: uuidv4(),
                    merchant_id: data.merchant_id,
                    branch_name: data.branch_name,
                    contact_person_id: data.contact_person_id,
                    phone: data.phone,
                    email: data.email,
                    description: data.description,
                },
            });

            // Create address if provided
            if (data.address) {
                await tx.address.create({
                    data: {
                        address_id: uuidv4(),
                        branch_id: branch.branch_id,
                        street: data.address.street,
                        city: data.address.city,
                        state: data.address.state,
                        country: data.address.country,
                        zip: data.address.zip,
                        unit: data.address.unit,
                        floor: data.address.floor,
                    },
                });
            }

            return { branch };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

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
     * Upload branch images (Logo, Feature Image, Galleries)
     * @param branch_id 
     * @param data 
     */
    async uploadBranchImages(branch_id: string, data: any) {
        const uploadedFilePaths: string[] = data.map((img: any) => path.join(process.cwd(), 'public', img.image_url));

        try {
            const result = await prisma.$transaction(async (tx) => {
                const uploadedImages = [];
    
                for (const img of data) {
                    // Determine correct image_type
                    let image_type: ImageType = ImageType.IMAGE;
                    if (img.image_type === 'LOGO') image_type = ImageType.LOGO;
                    else if (img.image_type === 'FEATURE_IMAGE') image_type = ImageType.FEATURE_IMAGE;
                    
                    // Use image_url as provided (should be /uploads/filename)
                    const record = await tx.branchImage.create({
                        data: {
                            branch_id,
                            image_id: uuidv4(),
                            image_url: img.image_url,
                            image_type: image_type,
                            uploaded_at: new Date(),
                        },
                    });
                    uploadedImages.push(record);
                }
                return { images: uploadedImages };
            }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    
            return result;
        } catch (error) {
            // If the transaction fails, clean up the uploaded files
            for (const filePath of uploadedFilePaths) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            // Re-throw the error to be handled by the controller
            throw new AppError("Failed to save images to database.", 500);
        }
    },

    /**
     * Update branch image
     * @param branch_id 
     * @param image_id 
     * @returns 
     */
    async updateBranchImage(branch_id: string, image_id: string, data: { image_url: string }) {  
        const result = await prisma.$transaction(async (tx) => {
            const image = await tx.branchImage.update({
                where: { image_id },
                data: {
                    image_url: data.image_url,
                },
            });
            return { image };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to update branch image", 500);
        }

        return result;
    },

    /**
     * Delete branch images
     * @param branch_id 
     * @param image_id 
     * @returns 
     */
    async deleteBranchImages(branch_id: string, image_id: string) { 
        const result = await prisma.$transaction(async (tx) => {
            const image = await tx.branchImage.findUnique({ where: { image_id } });

            if (image && image.image_url) {
                const imagePath = path.join(process.cwd(), 'public', image.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            const deletedImage = await tx.branchImage.delete({
                where: { image_id },
            });
            return { image: deletedImage };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to delete branch images", 500);
        }
    
        return result;
    },

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
    async updateBranchOpeningHours(branch_id: string, data: Partial<BranchOpeningHourSchema>) {
        const { day_of_week, open_time, close_time, is_closed } = data;

        if (!day_of_week) {
            throw new AppError("Day of the week is required", 400);
        }

        const result = await prisma.$transaction(async (tx) => {
            const existingHour = await tx.branchOpeningHour.findFirst({
                where: {
                    branch_id: branch_id,
                    day_of_week: day_of_week as any,
                },
            });

            if (existingHour) {
                const updatedHour = await tx.branchOpeningHour.update({
                    where: { id: existingHour.id },
                    data: {
                        open_time: open_time ? new Date(open_time) : existingHour.open_time,
                        close_time: close_time ? new Date(close_time) : existingHour.close_time,
                        is_closed: is_closed,
                        updated_at: new Date(),
                    },
                });
                return { opening_hours: updatedHour };
            } else {
                const newHour = await tx.branchOpeningHour.create({
                    data: {
                        id: uuidv4(),
                        branch_id: branch_id,
                        day_of_week: day_of_week as any,
                        open_time: open_time ? new Date(open_time) : new Date('1970-01-01T09:00:00.000Z'),
                        close_time: close_time ? new Date(close_time) : new Date('1970-01-01T18:00:00.000Z'),
                        is_closed: is_closed || false,
                        updated_at: new Date(),
                    },
                });
                return { opening_hours: newHour };
            }
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        if (!result) {
            throw new AppError("Failed to update branch opening hours", 500);
        }

        return result;
    },

    /**
     * Update branch contact person
     */

    /** */
}; 