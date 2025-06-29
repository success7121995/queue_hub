import { Request, Response } from "express";
import { ActivityType } from "@prisma/client";
import { withActivityLog } from "../utils/with-activity-log";
import { adminService } from "../services/admin-service";
import { AppError } from "../utils/app-error";

// Admin controller
// Handles: merchant management, user management, queue oversight, analytics
export const adminController = {
    /**
     * Approve a merchant
     * @param req - The request object
     * @param res - The response object
     */
    approveMerchant: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;
            
            const result = await adminService.approveMerchant(merchant_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.APPROVE_MERCHANT,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
                merchant_name: result?.merchant?.business_name,
            }),
        }
    ),

    /**
     * Reject a merchant
     * @param req - The request object
     * @param res - The response object
     */
    rejectMerchant: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;
            const { reason } = req.body;
            
            const result = await adminService.rejectMerchant(merchant_id, reason);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.REJECT_MERCHANT,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
                merchant_name: result?.merchant?.business_name,
                reason: req.body.reason,
            }),
        }
    ),

    /**
     * Suspend a user
     * @param req - The request object
     * @param res - The response object
     */
    suspendUser: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.params;
            const { reason } = req.body;
            
            const result = await adminService.suspendUser(user_id, reason);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.SUSPEND_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                target_user_id: req.params.user_id,
                target_user_email: result?.user?.email,
                reason: req.body.reason,
            }),
        }
    ),

    /**
     * Change user role
     * @param req - The request object
     * @param res - The response object
     */
    changeUserRole: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.params;
            const { role } = req.body;
            
            const result = await adminService.changeUserRole(user_id, role);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CHANGE_USER_ROLE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                target_user_id: req.params.user_id,
                target_user_email: result?.user?.email,
                new_role: req.body.role,
            }),
        }
    ),

    /**
     * Get system analytics
     * @param req - The request object
     * @param res - The response object
     */
    getSystemAnalytics: withActivityLog(
        async (req: Request, res: Response) => {
            const { start_date, end_date } = req.query;
            
            const result = await adminService.getSystemAnalytics({
                start_date: start_date as string,
                end_date: end_date as string,
            });
            res.status(200).json({ success: true, result });
            return result;
        }
    ),
}; 