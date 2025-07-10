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
exports.merchantService = {
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
    async getMerchants(user_role, queries) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let approvalStatus = queries.approval_status;
            const queriesCopy = { ...queries };
            delete queriesCopy.approval_status;
            const where = {
                ...queriesCopy,
            };
            if (approvalStatus) {
                if (Array.isArray(approvalStatus)) {
                    where.approval_status = { in: approvalStatus };
                }
                else {
                    where.approval_status = approvalStatus;
                }
            }
            const merchants = await tx.merchant.findMany({
                where,
                select: {
                    merchant_id: true,
                    business_name: true,
                    created_at: true,
                    updated_at: true,
                    description: true,
                    phone: true,
                    email: true,
                    ...(user_role === client_1.UserRole.ADMIN && {
                        subscription_status: true,
                        subscription_start: true,
                        subscription_end: true,
                        approval_status: true,
                        auto_renewal: true,
                        approved_at: true,
                        owner_id: true,
                    }),
                    Address: {
                        select: {
                            street: true,
                            city: true,
                            state: true,
                            country: true,
                            zip: true,
                            unit: true,
                            floor: true,
                        }
                    },
                    Logo: {
                        select: {
                            logo_url: true,
                        }
                    },
                    owner_id: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            if (!merchants) {
                throw new app_error_1.AppError("Merchants not found", 404);
            }
            const detailedMerchants = await Promise.all(merchants.map(async (merchant) => {
                const contactPerson = merchant.owner_id
                    ? await tx.user.findUnique({
                        where: { user_id: merchant.owner_id },
                        include: { Avatar: true }
                    })
                    : null;
                const userMerchants = await tx.userMerchant.findMany({
                    where: { merchant_id: merchant.merchant_id },
                });
                const branchCount = await tx.branch.count({
                    where: { merchant_id: merchant.merchant_id },
                });
                return {
                    merchant,
                    contactPerson,
                    userMerchants,
                    branchCount,
                };
            }));
            return { merchants: detailedMerchants };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        if (!result) {
            throw new app_error_1.AppError("Failed to get merchants", 500);
        }
        return result;
    },
    async updateMerchant(merchant_id, updateData) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({
                where: { merchant_id },
                data: updateData,
            });
            return { merchant };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to update merchant", 500);
        }
        return result;
    },
    async deleteMerchant(merchant_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.delete({
                where: { merchant_id },
            });
            const users = await tx.user.deleteMany({
                where: {
                    Merchant: {
                        merchant_id,
                    },
                },
            });
            return { merchant };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (!result) {
            throw new app_error_1.AppError("Failed to delete merchant", 500);
        }
        return result;
    },
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
    async updateMerchantAddress(merchant_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const existingAddress = await tx.address.findFirst({
                where: { merchant_id },
            });
            let address;
            if (existingAddress) {
                address = await tx.address.update({
                    where: { address_id: existingAddress.address_id },
                    data: {
                        ...data,
                        updated_at: new Date(),
                    },
                });
            }
            else {
                address = await tx.address.create({
                    data: {
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
    async createQueue(branch_id, queue_name, tags) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const newQueue = await tx.queue.create({
                data: {
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
                await tx.tag.deleteMany({
                    where: { entity_id: queue_id },
                });
                const tagData = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
                    tag_id: (0, uuid_1.v4)(),
                    entity_id: queue.queue_id,
                    entity_type: client_1.TagEntity.QUEUE,
                    tag_name: tag,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
                const createResult = await tx.tag.createMany({
                    data: tagData,
                    skipDuplicates: false,
                });
                if (!createResult || createResult.count !== tagData.length) {
                    throw new app_error_1.AppError("Failed to create all tags", 500);
                }
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
    async getQueueAnalytics(queue_id, params) {
        const { start_date, end_date } = params;
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
            avg_wait_time: Math.round(avg_wait_time / 1000 / 60),
        };
    },
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
            if (data.address) {
                await tx.address.create({
                    data: {
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
    async getBranchesByMerchantId(merchant_id, prefetch = false, user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let branches = [];
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
            let whereClause = { merchant_id };
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
    async updateBranchAddress(branch_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const existingAddress = await tx.address.findFirst({
                where: { branch_id },
            });
            if (!existingAddress) {
                throw new app_error_1.AppError("No address found for this branch", 404);
            }
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
    async uploadBranchImages(branch_id, data) {
        const uploadedFilePaths = data.map((img) => path_1.default.join(process.cwd(), 'public', img.image_url));
        try {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const uploadedImages = [];
                for (const img of data) {
                    let image_type = client_1.ImageType.IMAGE;
                    if (img.image_type === 'FEATURE_IMAGE')
                        image_type = client_1.ImageType.FEATURE_IMAGE;
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
            for (const filePath of uploadedFilePaths) {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            throw new app_error_1.AppError("Failed to save images to database.", 500);
        }
    },
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
    async switchBranch(user_id, branch_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
            if (userMerchant.role === 'OWNER') {
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
                const hasAccess = userMerchant.UserMerchantOnBranch.some(assignment => assignment.branch_id === branch_id);
                if (!hasAccess) {
                    throw new app_error_1.AppError("You do not have access to this branch. Please contact your administrator.", 403);
                }
            }
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
    async uploadLogo(merchant_id, logo_url) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const existingLogo = await tx.logo.findUnique({
                where: { merchant_id },
            });
            let logo;
            if (existingLogo) {
                if (existingLogo.logo_url) {
                    const oldFilePath = path_1.default.join(process.cwd(), 'public', existingLogo.logo_url);
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                    }
                }
                logo = await tx.logo.update({
                    where: { logo_id: existingLogo.logo_id },
                    data: {
                        logo_url,
                    },
                });
            }
            else {
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
