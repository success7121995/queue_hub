"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withActivityLog = void 0;
const admin_service_1 = require("../services/admin-service");
const app_error_1 = require("./app-error");
const withActivityLog = (handler, config) => {
    return async (req, res) => {
        let error = null;
        let status = 500;
        let result = null;
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            status = res.statusCode;
            return originalJson(body);
        };
        try {
            result = await handler(req, res);
            status = res.statusCode;
            error = null;
        }
        catch (err) {
            if (err instanceof app_error_1.AppError) {
                status = err.status;
                error = err.message;
                res.status(status).json({ success: false, error });
            }
            else {
                status = 500;
                error = "Unexpected error";
                res.status(500).json({ success: false, error });
                console.error(err);
            }
        }
        finally {
            try {
                if (config?.action) {
                    await admin_service_1.adminService.createActivityLog({
                        action: config.action,
                        action_data: config?.extractData?.(req, res, result) ?? {},
                        success: !error,
                        error,
                        status,
                        user_id: config?.extractUserId?.(req, res, result) ?? null,
                    });
                }
            }
            catch (logErr) {
                console.error("Activity log failed:", logErr);
            }
        }
    };
};
exports.withActivityLog = withActivityLog;
