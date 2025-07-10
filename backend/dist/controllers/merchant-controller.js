"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const with_activity_log_1 = require("../utils/with-activity-log");
const merchant_service_1 = require("../services/merchant-service");
const queue_service_1 = require("../services/queue-service");
const app_error_1 = require("../utils/app-error");
const user_service_1 = require("../services/user-service");
const branchSchema = zod_1.z.object({
    branch_name: zod_1.z.string().min(1, "Branch name is required"),
    contact_person_id: zod_1.z.string().min(1, "Contact person is required"),
    phone: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().min(1, "Branch phone is required").optional()),
    email: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().email("Invalid email address").optional()),
    description: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
});
const addressSchema = zod_1.z.object({
    country: zod_1.z.string().min(1, "Country is required"),
    street: zod_1.z.string().min(1, "Street is required"),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    zip: zod_1.z.string().min(1, "ZIP code is required"),
    unit: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
    floor: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
});
const branchFeatureSchema = zod_1.z.object({
    feature_name: zod_1.z.string().min(1, "Feature name is required"),
});
const branchTagSchema = zod_1.z.object({
    entity_id: zod_1.z.string().min(1, "Entity ID is required"),
    entity_type: zod_1.z.nativeEnum(client_1.TagEntity).default(client_1.TagEntity.MERCHANT),
    tag_name: zod_1.z.string().min(1, "Tag name is required"),
});
const branchOpeningHourSchema = zod_1.z.object({
    day_of_week: zod_1.z.number().min(1).max(7),
    open_time: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close_time: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    is_closed: zod_1.z.boolean().default(false),
});
const branchImageSchema = zod_1.z.object({
    logo: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
    feature_image: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
    galleries: zod_1.z.array(zod_1.z.string()).optional(),
});
const createBranchSchema = zod_1.z.object({
    branch_name: zod_1.z.string().min(1, "Branch name is required"),
    contact_person_id: zod_1.z.string().min(1, "Contact person is required"),
    phone: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
    email: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().email("Invalid email address").optional()),
    description: zod_1.z.preprocess((val) => val === "" ? undefined : val, zod_1.z.string().optional()),
    address: addressSchema,
});
const logoSchema = zod_1.z.object({
    logo_url: zod_1.z.string().min(1, "Logo URL is required"),
});
exports.merchantController = {
    getMerchantById: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const result = await merchant_service_1.merchantService.getMerchantById(merchant_id);
        res.status(200).json({ success: true, result });
    }),
    getMerchants: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const query = req.query;
        const queryParams = {};
        Object.keys(query).forEach(key => {
            if (query[key] !== undefined && query[key] !== '') {
                if (key === 'approval_status') {
                    if (Array.isArray(query[key])) {
                        queryParams[key] = query[key];
                    }
                    else {
                        queryParams[key] = [query[key]];
                    }
                }
                else {
                    queryParams[key] = query[key];
                }
            }
        });
        const result = await merchant_service_1.merchantService.getMerchants(user.role, queryParams);
        res.status(200).json({ success: true, result });
    }),
    updateProfile: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateMerchantProfile(merchant_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_MERCHANT,
        extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    updateMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateMerchant(merchant_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_MERCHANT,
        extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    deleteMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteMerchant(merchant_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.DELETE_MERCHANT,
        extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
        }),
    }),
    updateMerchantAddress: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateMerchantAddress(merchant_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_MERCHANT,
        extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    getUserMerchants: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const { prefetch } = req.query;
        const result = await merchant_service_1.merchantService.getUserMerchants(merchant_id);
        res.status(200).json({ success: true, result });
        return result;
    }),
    createQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const userData = await user_service_1.userService.getUserById(user.user_id);
        const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
        if (!selectedBranchId) {
            throw new app_error_1.AppError("No branch selected", 400);
        }
        const { queue_name, tags } = req.body;
        const result = await merchant_service_1.merchantService.createQueue(selectedBranchId, queue_name, tags);
        if (req.io) {
            req.io.emit("queueCreated", { message: "Queue created successfully" });
        }
        res.status(201).json({ success: true, result });
    }, {
        action: client_1.ActivityType.CREATE_QUEUE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            queue_name: req.body.queue_name,
        }),
    }),
    viewQueuesByBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const userData = await user_service_1.userService.getUserById(user.user_id);
        const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
        if (!selectedBranchId) {
            throw new app_error_1.AppError("No branch selected", 400);
        }
        const result = await queue_service_1.queueService.viewQueuesByBranch(selectedBranchId);
        res.status(200).json({ success: true, result });
    }),
    updateQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { queue_name, tags } = req.body.data;
        const result = await merchant_service_1.merchantService.updateQueue(queue_id, queue_name, tags);
        if (req.io) {
            req.io.emit("queueUpdated", { queueId: queue_id, message: "Queue updated successfully" });
        }
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_QUEUE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            queue_id: req.params.queue_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    deleteQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteQueue(queue_id);
        if (req.io) {
            req.io.emit("queueDeleted", { queueId: queue_id, message: "Queue deleted successfully" });
        }
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.DELETE_QUEUE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            queue_id: req.params.queue_id,
        }),
    }),
    viewQueueAnalytics: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { start_date, end_date } = req.query;
        const result = await merchant_service_1.merchantService.getQueueAnalytics(queue_id, {
            start_date: start_date,
            end_date: end_date,
        });
        res.status(200).json({ success: true, result });
    }),
    createBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const validatedData = createBranchSchema.parse(req.body);
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const merchant_id = user.merchant_id;
        if (!merchant_id) {
            throw new app_error_1.AppError("Merchant ID not found", 404);
        }
        const result = await merchant_service_1.merchantService.createBranch({
            ...validatedData,
            merchant_id
        });
        res.status(201).json({ success: true, result });
    }, {
        action: client_1.ActivityType.CREATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_name: req.body.branch_name,
            contact_person_id: req.body.contact_person_id,
        }),
    }),
    getBranchesByMerchantId: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        const { merchant_id } = req.params;
        const { prefetch, user_id } = req.query;
        const targetUserId = user_id || user?.user_id;
        const result = await merchant_service_1.merchantService.getBranchesByMerchantId(merchant_id, prefetch === 'true', targetUserId);
        res.status(200).json({ success: true, result });
    }),
    switchBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const { branch_id } = req.body;
        if (!branch_id) {
            throw new app_error_1.AppError("Branch ID is required", 400);
        }
        const result = await merchant_service_1.merchantService.switchBranch(user.user_id, branch_id);
        const updatedUserData = await user_service_1.userService.getUserById(user.user_id);
        res.status(200).json({
            success: true,
            result,
            user: updatedUserData.user
        });
    }, {
        action: client_1.ActivityType.UPDATE_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.body.branch_id,
        }),
    }),
    updateBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateBranch(branch_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    updateBranchAddress: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateBranchAddress(branch_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    createBranchFeature: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        const { feature_name } = req.body;
        const result = await merchant_service_1.merchantService.createBranchFeature(branch_id, feature_name);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            feature_name: req.body.feature_name,
        }),
    }),
    deleteBranchFeature: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { feature_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteBranchFeature(feature_id);
        res.status(200).json({ success: true, result });
    }),
    createBranchTag: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        const { tag_name } = req.body;
        const result = await merchant_service_1.merchantService.createBranchTag(branch_id, tag_name);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            tag_name: req.body.tag_name,
        }),
    }),
    deleteBranchTag: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { tag_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteBranchTag(tag_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            tag_id: req.body.tag_id,
        }),
    }),
    uploadBranchImages: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        let files = [];
        if (req.file) {
            files = [req.file];
        }
        else if (req.files && Array.isArray(req.files)) {
            files = req.files;
        }
        if (!files.length) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        let imageType;
        if (req.route.path.includes('logo')) {
            imageType = 'LOGO';
        }
        else if (req.route.path.includes('feature-image')) {
            imageType = 'FEATURE_IMAGE';
        }
        else if (req.route.path.includes('galleries')) {
            imageType = 'IMAGE';
        }
        else {
            return res.status(400).json({ success: false, error: 'Invalid image type' });
        }
        const imageData = files.map(file => ({
            image_id: undefined,
            image_url: `/uploads/${file.filename}`,
            image_type: imageType,
            uploaded_at: new Date(),
        }));
        const result = await merchant_service_1.merchantService.uploadBranchImages(branch_id, imageData);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    updateBranchImage: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id, image_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateBranchImage(branch_id, image_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            image_id: req.params.image_id,
        }),
    }),
    deleteBranchImages: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id, image_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteBranchImages(branch_id, image_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            image_id: req.params.image_id,
        }),
    }),
    updateBranchOpeningHours: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateBranchOpeningHours(branch_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    uploadLogo: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const merchant_id = user.merchant_id;
        if (!merchant_id) {
            throw new app_error_1.AppError("Merchant not found", 404);
        }
        if (!req.file) {
            throw new app_error_1.AppError("No logo file uploaded", 400);
        }
        const logo_url = `/uploads/${req.file.filename}`;
        const result = await merchant_service_1.merchantService.uploadLogo(merchant_id, logo_url);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_MERCHANT,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.session.user?.merchant_id,
            logo_url: req.file ? `/uploads/${req.file.filename}` : null,
        }),
    }),
    deleteLogo: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { logo_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteLogo(logo_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_MERCHANT,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            logo_id: req.params.logo_id,
        }),
    }),
};
