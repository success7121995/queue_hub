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
    // Branch Information 
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
// Schema for creating a branch with address
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
// Merchant controller
// Handles: profile management, queue operations, analytics
exports.merchantController = {
    /**
     * Get merchant by id
     * @param req - The request object
     * @param res - The response object
     */
    getMerchantById: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const result = await merchant_service_1.merchantService.getMerchantById(merchant_id);
        res.status(200).json({ success: true, result });
    }),
    /**
     * Update merchant profile
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Update merchant address
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Get user merchants
     * @param req - The request object
     * @param res - The response object
     */
    getUserMerchants: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const { prefetch } = req.query;
        const result = await merchant_service_1.merchantService.getUserMerchants(merchant_id);
        res.status(200).json({ success: true, result });
        return result;
    }),
    /**
     * Create a new queue
     * @param req - The request object
     * @param res - The response object
     */
    createQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        // Get the selected branch ID from user data
        const userData = await user_service_1.userService.getUserById(user.user_id);
        const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
        if (!selectedBranchId) {
            throw new app_error_1.AppError("No branch selected", 400);
        }
        const { queue_name, tags } = req.body;
        const result = await merchant_service_1.merchantService.createQueue(selectedBranchId, queue_name, tags);
        // Emit socket event for queue creation
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
    /**
     * View queues by merchant
     * @param req - The request object
     * @param res - The response object
     */
    viewQueuesByBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        // Get the selected branch ID from user data
        const userData = await user_service_1.userService.getUserById(user.user_id);
        const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
        if (!selectedBranchId) {
            throw new app_error_1.AppError("No branch selected", 400);
        }
        const result = await queue_service_1.queueService.viewQueuesByBranch(selectedBranchId);
        res.status(200).json({ success: true, result });
    }),
    /**
     * Update queue details
     * @param req - The request object
     * @param res - The response object
     */
    updateQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { queue_name, tags } = req.body.data;
        const result = await merchant_service_1.merchantService.updateQueue(queue_id, queue_name, tags);
        // Emit socket event for queue update
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
    /**
     * Delete a queue
     * @param req - The request object
     * @param res - The response object
     */
    deleteQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteQueue(queue_id);
        // Emit socket event for queue deletion
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
    /**
     * View queue analytics
     * @param req - The request object
     * @param res - The response object
     */
    viewQueueAnalytics: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { start_date, end_date } = req.query;
        const result = await merchant_service_1.merchantService.getQueueAnalytics(queue_id, {
            start_date: start_date,
            end_date: end_date,
        });
        res.status(200).json({ success: true, result });
    }),
    /**
     * Create a new branch
     * @param req - The request object
     * @param res - The response object
     */
    createBranch: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const validatedData = createBranchSchema.parse(req.body);
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        // Get merchant_id from the user's session
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
    /**
     * Get branches by merchant id
     * @param req - The request object
     * @param res - The response object
     */
    getBranchesByMerchantId: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        const { merchant_id } = req.params;
        const { prefetch, user_id } = req.query;
        // Use the user_id from query params if provided, otherwise use session user
        const targetUserId = user_id || user?.user_id;
        const result = await merchant_service_1.merchantService.getBranchesByMerchantId(merchant_id, prefetch === 'true', targetUserId);
        res.status(200).json({ success: true, result });
    }),
    /**
     * Switch user's selected branch
     * @param req - The request object
     * @param res - The response object
     */
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
        // Return the updated user data so frontend can refresh auth
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
    /**
     * Update branch data
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Update branch address
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Create a new branch feature
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Delete a branch feature
     * @param req - The request object
     * @param res - The response object
     */
    deleteBranchFeature: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { feature_id } = req.params;
        const result = await merchant_service_1.merchantService.deleteBranchFeature(feature_id);
        res.status(200).json({ success: true, result });
    }),
    /**
     * Create a new branch tag
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Delete a branch tag
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Update branch images (single or multiple)
     * @param req - The request object
     * @param res - The response object
     */
    uploadBranchImages: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id } = req.params;
        // Use multer's req.file or req.files
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
        // Determine image type based on route path
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
        // Prepare data for DB: each file gets a record
        const imageData = files.map(file => ({
            image_id: undefined, // Let DB generate or use uuid if needed
            image_url: `/uploads/${file.filename}`,
            image_type: imageType,
            uploaded_at: new Date(),
        }));
        // Save to DB
        const result = await merchant_service_1.merchantService.uploadBranchImages(branch_id, imageData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    /**
     * Update branch image
     * @param req - The request object
     * @param res - The response object
     */
    updateBranchImage: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { branch_id, image_id } = req.params;
        const updateData = req.body;
        const result = await merchant_service_1.merchantService.updateBranchImage(branch_id, image_id, updateData);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.UPDATE_BRANCH,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            branch_id: req.params.branch_id,
            image_id: req.params.image_id,
        }),
    }),
    /**
     * Delete branch images
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Update branch opening hours
     * @param req - The request object
     * @param res - The response object
     */
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
    /**
     * Create a new logo
     * @param req - The request object
     * @param res - The response object
     */
    uploadLogo: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const merchant_id = user.merchant_id;
        if (!merchant_id) {
            throw new app_error_1.AppError("Merchant not found", 404);
        }
        // Check if file was uploaded
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
    /**
     * Delete a logo
     * @param req - The request object
     * @param res - The response object
     */
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
