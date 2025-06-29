"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const client_1 = require("@prisma/client");
const with_activity_log_1 = require("../utils/with-activity-log");
const admin_service_1 = require("../services/admin-service");
// Admin controller
// Handles: merchant management, user management, queue oversight, analytics
exports.adminController = {
    /**
     * Approve a merchant
     * @param req - The request object
     * @param res - The response object
     */
    approveMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const result = await admin_service_1.adminService.approveMerchant(merchant_id);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.APPROVE_MERCHANT,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            merchant_name: result?.merchant?.business_name,
        }),
    }),
    /**
     * Reject a merchant
     * @param req - The request object
     * @param res - The response object
     */
    rejectMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const { reason } = req.body;
        const result = await admin_service_1.adminService.rejectMerchant(merchant_id, reason);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.REJECT_MERCHANT,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            merchant_name: result?.merchant?.business_name,
            reason: req.body.reason,
        }),
    }),
    /**
     * Suspend a user
     * @param req - The request object
     * @param res - The response object
     */
    suspendUser: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.params;
        const { reason } = req.body;
        const result = await admin_service_1.adminService.suspendUser(user_id, reason);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.SUSPEND_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            target_user_id: req.params.user_id,
            target_user_email: result?.user?.email,
            reason: req.body.reason,
        }),
    }),
    /**
     * Change user role
     * @param req - The request object
     * @param res - The response object
     */
    changeUserRole: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.params;
        const { role } = req.body;
        const result = await admin_service_1.adminService.changeUserRole(user_id, role);
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.CHANGE_USER_ROLE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            target_user_id: req.params.user_id,
            target_user_email: result?.user?.email,
            new_role: req.body.role,
        }),
    }),
    /**
     * Get system analytics
     * @param req - The request object
     * @param res - The response object
     */
    getSystemAnalytics: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { start_date, end_date } = req.query;
        const result = await admin_service_1.adminService.getSystemAnalytics({
            start_date: start_date,
            end_date: end_date,
        });
        res.status(200).json({ success: true, result });
        return result;
    }, {
        action: client_1.ActivityType.VIEW_ALL_QUEUES,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            date_range: {
                start: req.query.start_date,
                end: req.query.end_date,
            },
            metrics: Object.keys(result?.metrics ?? {}),
        }),
    }),
};
