"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const client_1 = require("@prisma/client");
const with_activity_log_1 = require("../utils/with-activity-log");
const admin_service_1 = require("../services/admin-service");
exports.adminController = {
    getAdmins: (0, with_activity_log_1.withActivityLog)(async (_, res) => {
        const result = await admin_service_1.adminService.getAdmins();
        res.status(200).json({ success: true, result });
    }),
    approveMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { merchant_id } = req.params;
        const { approval_status } = req.body;
        const result = await admin_service_1.adminService.approveMerchant(merchant_id, approval_status);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.APPROVE_MERCHANT,
        extractUserId: (req) => req.session.user?.user_id,
        extractData: (req, res, result) => ({
            merchant_id: req.params.merchant_id,
            ...(req.body.reason ? { reason: req.body.reason } : {}),
        }),
    }),
    suspendUser: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.params;
        const { reason } = req.body;
        const result = await admin_service_1.adminService.suspendUser(user_id, reason);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.SUSPEND_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            target_user_id: req.params.user_id,
            target_user_email: result?.user?.email,
            reason: req.body.reason,
        }),
    }),
    changeUserRole: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.params;
        const { role } = req.body;
        const result = await admin_service_1.adminService.changeUserRole(user_id, role);
        res.status(200).json({ success: true, result });
    }, {
        action: client_1.ActivityType.CHANGE_USER_ROLE,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            target_user_id: req.params.user_id,
            target_user_email: result?.user?.email,
            new_role: req.body.role,
        }),
    }),
    getSystemAnalytics: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { start_date, end_date } = req.query;
        const result = await admin_service_1.adminService.getSystemAnalytics({
            start_date: start_date,
            end_date: end_date,
        });
        res.status(200).json({ success: true, result });
    }),
};
