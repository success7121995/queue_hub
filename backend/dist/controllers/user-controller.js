"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const client_1 = require("@prisma/client");
const with_activity_log_1 = require("../utils/with-activity-log");
const user_service_1 = require("../services/user-service");
const app_error_1 = require("../utils/app-error");
const zod_1 = require("zod");
const updateEmployeeSchema = zod_1.z.object({
    fname: zod_1.z.string().min(1, "First name is required").optional(),
    lname: zod_1.z.string().min(1, "Last name is required").optional(),
    phone: zod_1.z.string().min(1, "Phone number is required").optional(),
    position: zod_1.z.string().min(1, "Position is required").optional(),
    role: zod_1.z.nativeEnum(client_1.MerchantRole).optional(),
    staff_id: zod_1.z.string().min(1, "Staff ID is required").optional(),
});
exports.userController = {
    /**
     * Update user profile
     * @param req - The request object
     * @param res - The response object
     */
    updateProfile: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        const updateData = req.body;
        const result = await user_service_1.userService.updateUserProfile(user.user_id, updateData);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.UPDATE_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            user_id: req.params.user_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    /**
     * Get current user info
     * @param req - The request object
     * @param res - The response object
     */
    me: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("Not authenticated", 401);
        }
        const userData = await user_service_1.userService.getUserById(user.user_id);
        res.status(200).json({
            success: true,
            user: {
                ...userData.user
            }
        });
        return userData;
    }, {
        action: client_1.ActivityType.VIEW_PROFILE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: () => ({}),
    }),
    /**
     * Get employees
     * @param req - The request object
     * @param res - The response object
     */
    getEmployees: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        const merchant_id = user?.merchant_id;
        if (!merchant_id) {
            throw new app_error_1.AppError("Merchant ID not found", 404);
        }
        const result = await user_service_1.userService.getEmployees(merchant_id);
        res.status(200).json({ success: true, result });
    }),
    /**
     * Assign branches to employee
     * @param req - The request object
     * @param res - The response object
     */
    assignBranches: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { staff_id } = req.params;
        const { branch_ids } = req.body;
        const result = await user_service_1.userService.assignBranches(staff_id, branch_ids);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_STAFF_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req) => ({
            staff_id: req.params.staff_id,
            branch_ids: req.body.branch_ids
        }),
    }),
    /**
     * Update employee
     * @param req - The request object
     * @param res - The response object
     */
    updateEmployee: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { staff_id } = req.params;
        const updateData = updateEmployeeSchema.parse(req.body);
        const result = await user_service_1.userService.updateEmployee(staff_id, updateData);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_STAFF_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req) => ({
            staff_id: req.params.staff_id,
            updated_fields: Object.keys(req.body),
        }),
    }),
    /**
     * Delete employee
     * @param req - The request object
     * @param res - The response object
     */
    deleteEmployee: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.params;
        const result = await user_service_1.userService.deleteEmployee(user_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.DELETE_STAFF_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req) => ({
            user_id: req.params.user_id,
        }),
    }),
    /**
     * Upload avatar
     * @param req - The request object
     * @param res - The response object
     */
    uploadAvatar: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("Not authenticated", 401);
        }
        const file = req.file;
        if (!file) {
            throw new app_error_1.AppError("No file uploaded", 400);
        }
        const image_url = `/uploads/${file.filename}`;
        const result = await user_service_1.userService.uploadAvatar(user.user_id, image_url);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req) => ({
            user_id: req.user?.user_id ?? null,
            image_url: req.file ? `/uploads/${req.file.filename}` : null,
        }),
    }),
    /**
     * Delete avatar
     * @param req - The request object
     * @param res - The response object
     */
    deleteAvatar: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user) {
            throw new app_error_1.AppError("Not authenticated", 401);
        }
        const result = await user_service_1.userService.deleteAvatar(user.user_id);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.UPDATE_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req) => ({
            user_id: req.user?.user_id ?? null,
        }),
    }),
    /**
     * Join a queue
     * @param req - The request object
     * @param res - The response object
     */
    joinQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { user_id } = req.user;
        const result = await user_service_1.userService.joinQueue(queue_id, user_id);
        res.status(201).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.CREATE_TICKET,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            queue_id: req.params.queue_id,
            ticket_number: result?.entry?.number,
        }),
    }),
    /**
     * Leave a queue
     * @param req - The request object
     * @param res - The response object
     */
    leaveQueue: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { queue_id } = req.params;
        const { user_id } = req.user;
        const result = await user_service_1.userService.leaveQueue(queue_id, user_id);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.CLOSE_TICKET,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            queue_id: req.params.queue_id,
            ticket_number: result?.entry?.number,
        }),
    }),
    /**
     * Get user's queue history
     * @param req - The request object
     * @param res - The response object
     */
    getQueueHistory: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.user;
        const { start_date, end_date } = req.query;
        const result = await user_service_1.userService.getQueueHistory(user_id, {
            start_date: start_date,
            end_date: end_date,
        });
        res.status(200).json({ success: true, result });
        return result;
    }),
};
