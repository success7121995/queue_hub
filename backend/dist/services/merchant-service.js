"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantService = void 0;
const prisma_1 = require("../lib/prisma");
const uuid_1 = require("uuid");
const app_error_1 = require("../utils/app-error");
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Merchant service
// Handles: queue management, customer operations, merchant analytics
exports.merchantService = {
    /**
     * Get merchant by id
     * @param merchant_id - The merchant ID
     * @returns The merchant
     */
    async getMerchantById(merchant_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.findUnique({
                where: { merchant_id },
                include: {
                    Address: true,
                    Logo: true,
                },
            });
            if (!merchant) {
                throw new app_error_1.AppError("Merchant not found", 404);
            }
            return { merchant };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to get merchant", 500);
        }
        return result;
    },
    /**
     * Get user merchants
     * @param merchant_id - The merchant ID
     * @returns
     */
    async getUserMerchants(merchant_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const userMerchants = await tx.userMerchant.findMany({
                where: {
                    merchant_id,
                },
                include: {
                    User: true,
                }
            });
            return { user_merchants: userMerchants };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to get user merchants", 500);
        }
        return result;
    },
    /**
     * Update merchant profile
     * @param merchant_id - The merchant ID
     * @param updateData - The data to update
     */
    async updateMerchantProfile(merchant_id, updateData) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({
                where: { merchant_id },
                data: {
                    ...updateData,
                    updated_at: new Date(),
                },
            });
            return { merchant };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to update merchant profile", 500);
        }
        return result;
    },
    /**
     * Update merchant address
     * @param merchant_id - The merchant ID
     * @param data - The address data to update
     */
    async updateMerchantAddress(merchant_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // First, find the address associated with this merchant
            const existingAddress = await tx.address.findFirst({
                where: { merchant_id },
            });
            let address;
            if (existingAddress) {
                // Update existing address
                address = await tx.address.update({
                    where: { address_id: existingAddress.address_id },
                    data: {
                        ...data,
                        updated_at: new Date(),
                    },
                });
            }
            else {
                // Create new address
                address = await tx.address.create({
                    data: {
                        address_id: (0, uuid_1.v4)(),
                        merchant_id,
                        street: data.street,
                        city: data.city,
                        state: data.state,
                        country: data.country,
                        zip: data.zip,
                        unit: data.unit,
                        floor: data.floor,
                    },
                });
            }
            return { address };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to update merchant address", 500);
        }
        return result;
    },
    /**
     * Create a new queue
     * @param queue - The queue object
     * @param tags - The tags to create
     * @returns The created queue and tags
     */
    async createQueue(branch_id, queue_name, tags) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const newQueue = await tx.queue.create({
                data: {
                    queue_id: (0, uuid_1.v4)(),
                    queue_name,
                    branch_id,
                    updated_at: new Date(),
                },
            });
            if (!newQueue || !newQueue.queue_id) {
                throw new app_error_1.AppError("Failed to create queue", 500);
            }
            if (tags) {
                const tagData = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
                    tag_id: (0, uuid_1.v4)(),
                    entity_id: newQueue.queue_id,
                    entity_type: client_1.TagEntity.QUEUE,
                    tag_name: tag,
                    updated_at: new Date()
                }));
                const newTags = await tx.tag.createMany({
                    data: tagData,
                });
                if (!newTags || newTags.count !== tagData.length) {
                    throw new app_error_1.AppError("Failed to create tags", 500);
                }
                const fetchedTags = await tx.tag.findMany({
                    where: {
                        entity_id: newQueue.queue_id,
                    },
                });
                if (!fetchedTags || fetchedTags.length !== tagData.length) {
                    throw new app_error_1.AppError("Failed to fetch tags", 500);
                }
                return { queue: newQueue, tags: fetchedTags };
            }
            return { queue: newQueue };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    /**
     * Update queue details
     * @param queue_id - The queue ID
     * @param updateData - The data to update
     */
    async updateQueue(queue_id, queue_name, tags) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let queue = await tx.queue.findUnique({
                where: { queue_id },
            });
            if (!queue) {
                throw new app_error_1.AppError("Queue not found", 404);
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
            let tagRecords = [];
            if (tags) {
                // Delete existing tags for this queue
                await tx.tag.deleteMany({
                    where: { entity_id: queue_id },
                });
                // Generate tag data
                const tagData = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
                    tag_id: (0, uuid_1.v4)(),
                    entity_id: queue.queue_id,
                    entity_type: client_1.TagEntity.QUEUE,
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
                    throw new app_error_1.AppError("Failed to create all tags", 500);
                }
                // Retrieve full tag records
                tagRecords = await tx.tag.findMany({
                    where: {
                        entity_id: queue.queue_id,
                        tag_name: { in: tags.split(',').map(tag => tag.trim()).filter(Boolean) },
                    },
                });
            }
            else {
                await tx.tag.deleteMany({
                    where: { entity_id: queue_id },
                });
                tagRecords = [];
            }
            return { queue, tags: tagRecords };
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
        });
        if (!result) {
            throw new app_error_1.AppError("Failed to update queue", 500);
        }
        return result;
    },
    /**
     * Open or close a queue
     * @param queue_id - The queue ID
     * @param status - The status to set
     */
    async openOrCloseQueue(queue_id, status) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const queue = await tx.queue.update({
                where: { queue_id },
                data: { queue_status: status },
            });
            return { queue };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to open or close queue", 500);
        }
        return result;
    },
    /**
     * Delete a queue
     * @param queue_id - The queue ID
     */
    async deleteQueue(queue_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const queue = await tx.queue.delete({
                where: { queue_id },
            });
            return { queue };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete queue", 500);
        }
        return result;
    },
    /**
     * Get queue analytics
     * @param queue_id - The queue ID
     * @param params - The analytics parameters
     */
    async getQueueAnalytics(queue_id, params) {
        const { start_date, end_date } = params;
        // Get queue entries within date range
        const entries = await prisma_1.prisma.queueEntry.findMany({
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
    async createBranch(data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const branch = await tx.branch.create({
                data: {
                    branch_id: (0, uuid_1.v4)(),
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
                        address_id: (0, uuid_1.v4)(),
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    /**
     * Get branches by merchant id
     * @param merchant_id
     * @param prefetch
     * @param user_id - Optional user ID to filter branches based on role
     * @returns
     */
    async getBranchesByMerchantId(merchant_id, prefetch = false, user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let branches = [];
            // If user_id is provided, check their role and branch assignments
            let userRole = null;
            let userBranchAssignments = [];
            if (user_id) {
                const userMerchant = await tx.userMerchant.findUnique({
                    where: { user_id },
                    include: {
                        UserMerchantOnBranch: {
                            select: { branch_id: true }
                        }
                    }
                });
                if (userMerchant) {
                    userRole = userMerchant.role;
                    userBranchAssignments = userMerchant.UserMerchantOnBranch.map(umb => umb.branch_id);
                }
            }
            // Build where clause based on user role
            let whereClause = { merchant_id };
            // If user is not owner and has branch assignments, filter by assigned branches
            if (user_id && userRole && userRole !== 'OWNER' && userBranchAssignments.length > 0) {
                whereClause.branch_id = { in: userBranchAssignments };
            }
            if (prefetch) {
                branches = await tx.branch.findMany({
                    where: whereClause,
                    select: {
                        branch_id: true,
                        branch_name: true,
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                });
                return { branches };
            }
            else {
                branches = await tx.branch.findMany({
                    where: whereClause,
                    include: {
                        BranchFeature: true,
                        BranchImage: true,
                        BranchOpeningHour: true,
                        Address: true,
                        UserMerchantOnBranch: true,
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                });
                const contactPersonIds = branches
                    .map(branch => branch.contact_person_id)
                    .filter((id) => !!id);
                const tags = await tx.tag.findMany({
                    where: {
                        entity_type: client_1.TagEntity.BRANCH,
                        entity_id: { in: branches.map(branch => branch.branch_id).filter((id) => !!id) },
                    },
                });
                // Group tags by entity_id (branch_id)
                const tagsByBranch = tags.reduce((acc, tag) => {
                    if (!acc[tag.entity_id]) {
                        acc[tag.entity_id] = [];
                    }
                    acc[tag.entity_id].push(tag);
                    return acc;
                }, {});
                let contact_person_map = {};
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
                    }, {});
                }
                // 補上 contact_person and tags
                const branchesWithContactPerson = branches.map(branch => ({
                    ...branch,
                    contact_person: contact_person_map[branch.contact_person_id ?? ""] ?? null,
                    Tag: tagsByBranch[branch.branch_id] || [],
                }));
                return { branches: branchesWithContactPerson };
            }
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to get branches", 500);
        }
        return result;
    },
    /**
     * Update branch data
     * @param branch_id
     * @param data
     * @returns
     */
    async updateBranch(branch_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const branch = await tx.branch.update({
                where: { branch_id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
            });
            return { branch };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to update branch", 500);
        }
        return result;
    },
    /**
     * Update branch address
     * @param branch_id
     * @param data
     * @returns
     */
    async updateBranchAddress(branch_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // First, find the address associated with this branch
            const existingAddress = await tx.address.findFirst({
                where: { branch_id },
            });
            if (!existingAddress) {
                throw new app_error_1.AppError("No address found for this branch", 404);
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to update branch address", 500);
        }
        return result;
    },
    /**
     * Upload branch images (Logo, Feature Image, Galleries)
     * @param branch_id
     * @param data
     */
    async uploadBranchImages(branch_id, data) {
        const uploadedFilePaths = data.map((img) => path_1.default.join(process.cwd(), 'public', img.image_url));
        try {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const uploadedImages = [];
                for (const img of data) {
                    // Determine correct image_type
                    let image_type = client_1.ImageType.IMAGE;
                    if (img.image_type === 'FEATURE_IMAGE')
                        image_type = client_1.ImageType.FEATURE_IMAGE;
                    // Use image_url as provided (should be /uploads/filename)
                    const record = await tx.branchImage.create({
                        data: {
                            branch_id,
                            image_id: (0, uuid_1.v4)(),
                            image_url: img.image_url,
                            image_type: image_type,
                            uploaded_at: new Date(),
                        },
                    });
                    uploadedImages.push(record);
                }
                return { images: uploadedImages };
            }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
            return result;
        }
        catch (error) {
            // If the transaction fails, clean up the uploaded files
            for (const filePath of uploadedFilePaths) {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            // Re-throw the error to be handled by the controller
            throw new app_error_1.AppError("Failed to save images to database.", 500);
        }
    },
    /**
     * Update branch image
     * @param branch_id
     * @param image_id
     * @returns
     */
    async updateBranchImage(branch_id, image_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const image = await tx.branchImage.update({
                where: { image_id },
                data: {
                    image_url: data.image_url,
                },
            });
            return { image };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to update branch image", 500);
        }
        return result;
    },
    /**
     * Delete branch images
     * @param branch_id
     * @param image_id
     * @returns
     */
    async deleteBranchImages(branch_id, image_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const image = await tx.branchImage.findUnique({ where: { image_id } });
            if (image && image.image_url) {
                const imagePath = path_1.default.join(process.cwd(), 'public', image.image_url);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            const deletedImage = await tx.branchImage.delete({
                where: { image_id },
            });
            return { image: deletedImage };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete branch images", 500);
        }
        return result;
    },
    /**
     * Create a new branch feature
     * @param branch_id
     * @param feature_name
     * @returns
     */
    async createBranchFeature(branch_id, feature_name) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const feature = await tx.branchFeature.create({
                data: {
                    branch_id,
                    feature_id: (0, uuid_1.v4)(),
                    label: feature_name,
                    is_positive: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return { feature };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to create branch feature", 500);
        }
        return result;
    },
    /**
     * Delete a branch feature
     * @param feature_id
     * @returns
     */
    async deleteBranchFeature(feature_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const feature = await tx.branchFeature.delete({
                where: { feature_id },
            });
            return { feature };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete branch feature", 500);
        }
        return result;
    },
    /**
     * Create a new branch tag
     * @param branch_id
     * @param tag_name
     * @returns
     */
    async createBranchTag(branch_id, tag_name) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const tag = await tx.tag.create({
                data: {
                    entity_id: branch_id,
                    entity_type: client_1.TagEntity.BRANCH,
                    tag_id: (0, uuid_1.v4)(),
                    tag_name: tag_name,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return { tag };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to create branch tag", 500);
        }
        return result;
    },
    /**
     * Delete a branch tag
     * @param tag_id - The tag ID
     */
    async deleteBranchTag(tag_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const tag = await tx.tag.findUnique({
                where: { tag_id },
            });
            if (!tag) {
                throw new app_error_1.AppError("Tag not found", 404);
            }
            const deletedTag = await tx.tag.delete({
                where: { tag_id },
            });
            return { tag: deletedTag };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete branch tag", 500);
        }
        return result;
    },
    /**
     * Update branch opening hours
     */
    async updateBranchOpeningHours(branch_id, data) {
        const { day_of_week, open_time, close_time, is_closed } = data;
        if (!day_of_week) {
            throw new app_error_1.AppError("Day of the week is required", 400);
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const existingHour = await tx.branchOpeningHour.findFirst({
                where: {
                    branch_id: branch_id,
                    day_of_week: day_of_week,
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
            }
            else {
                const newHour = await tx.branchOpeningHour.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        branch_id: branch_id,
                        day_of_week: day_of_week,
                        open_time: open_time ? new Date(open_time) : new Date('1970-01-01T09:00:00.000Z'),
                        close_time: close_time ? new Date(close_time) : new Date('1970-01-01T18:00:00.000Z'),
                        is_closed: is_closed || false,
                        updated_at: new Date(),
                    },
                });
                return { opening_hours: newHour };
            }
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to update branch opening hours", 500);
        }
        return result;
    },
    /**
     * Switch user's selected branch
     * @param user_id - The user ID
     * @param branch_id - The branch ID to switch to
     * @returns The updated UserMerchant record
     */
    async switchBranch(user_id, branch_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Get user merchant data with branch assignments
            const userMerchant = await tx.userMerchant.findUnique({
                where: { user_id },
                include: {
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
            if (!userMerchant) {
                throw new app_error_1.AppError("User merchant not found", 404);
            }
            // Check if user is owner - owners can access all branches
            if (userMerchant.role === 'OWNER') {
                // For owners, just verify the branch exists and belongs to their merchant
                const branch = await tx.branch.findFirst({
                    where: {
                        branch_id,
                        merchant_id: userMerchant.merchant_id
                    }
                });
                if (!branch) {
                    throw new app_error_1.AppError("Branch not found or does not belong to this merchant", 404);
                }
            }
            else {
                // For non-owners, check if they have access to this specific branch
                const hasAccess = userMerchant.UserMerchantOnBranch.some(assignment => assignment.branch_id === branch_id);
                if (!hasAccess) {
                    throw new app_error_1.AppError("You do not have access to this branch. Please contact your administrator.", 403);
                }
            }
            // Update the selected_branch_id
            const updatedUserMerchant = await tx.userMerchant.update({
                where: { user_id },
                data: {
                    selected_branch_id: branch_id,
                    updated_at: new Date(),
                },
                include: {
                    User: true,
                    Merchant: true,
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
            return { userMerchant: updatedUserMerchant };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to switch branch", 500);
        }
        return result;
    },
    /**
     * Upload logo
     * @param merchant_id - The merchant ID
     * @param logo_url - The logo URL
     * @returns The updated logo
     */
    async uploadLogo(merchant_id, logo_url) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Check if there's already a logo for this merchant
            const existingLogo = await tx.logo.findUnique({
                where: { merchant_id },
            });
            let logo;
            if (existingLogo) {
                // Delete the old logo file if it exists
                if (existingLogo.logo_url) {
                    const oldFilePath = path_1.default.join(process.cwd(), 'public', existingLogo.logo_url);
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                    }
                }
                // Update existing logo
                logo = await tx.logo.update({
                    where: { logo_id: existingLogo.logo_id },
                    data: {
                        logo_url,
                    },
                });
            }
            else {
                // Create new logo
                logo = await tx.logo.create({
                    data: {
                        logo_id: (0, uuid_1.v4)(),
                        merchant_id,
                        logo_url,
                    },
                });
            }
            if (!logo) {
                throw new app_error_1.AppError("Failed to upload logo", 500);
            }
            return { logo };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to upload logo", 500);
        }
        return result;
    },
    /**
     * Delete logo
     * @param logo_id - The logo ID
     * @returns The deleted logo
     */
    async deleteLogo(logo_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const logo = await tx.logo.findUnique({
                where: { logo_id },
            });
            if (!logo) {
                throw new app_error_1.AppError("Logo not found", 404);
            }
            const deletedLogo = await tx.logo.delete({
                where: { logo_id },
            });
            if (!deletedLogo) {
                throw new app_error_1.AppError("Failed to delete logo", 500);
            }
            // Delete the logo file
            const filePath = path_1.default.join(process.cwd(), 'public', logo.logo_url);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete logo file: ${err.message}`);
                }
            });
            return { success: true };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete logo", 500);
        }
        return result;
    }
};
