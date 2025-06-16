import { Request, Response } from "express";
import { ActivityType, Queue, Tag } from "@prisma/client";
import { withActivityLog } from "../utils/with-activity-log";
import { merchantService } from "../services/merchant-service";
import { queueService } from "../services/queue-service";
import { AppError } from "../utils/app-error";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                role: string;
            };
        }
    }
}

// Merchant controller
// Handles: profile management, queue operations, analytics
export const merchantController = {

    /**
     * Update merchant profile
     * @param req - The request object
     * @param res - The response object
     */
    updateProfile: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;
            const updateData = req.body;
            
            const result = await merchantService.updateMerchantProfile(merchant_id, updateData);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_MERCHANT,
            extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Create a new queue
     * @param req - The request object
     * @param res - The response object
     */
    createQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user) {
                throw new AppError("User not found", 404);
            }

            const branch_id = user.branchId as string;
            const { queue_name, tags } = req.body;
            
            const result = await merchantService.createQueue(branch_id, queue_name, tags);
            res.status(201).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CREATE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                queue_name: req.body.queue_name,
            }),
        }
    ),

    /**
     * View queues by merchant
     * @param req - The request object
     * @param res - The response object
     */
    viewQueuesByBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;

            console.log(branch_id)

            const result = await queueService.viewQueuesByBranch(branch_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
            }),
        }
    ),

    /**
     * Update queue details
     * @param req - The request object
     * @param res - The response object
     */
    updateQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { queue_name, tags } = req.body.data;

            const result = await merchantService.updateQueue(queue_id, queue_name, tags);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Delete a queue
     * @param req - The request object
     * @param res - The response object
     */
    deleteQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            
            const result = await merchantService.deleteQueue(queue_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.DELETE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
            }),
        }
    ),

    /**
     * View queue analytics
     * @param req - The request object
     * @param res - The response object
     */
    viewQueueAnalytics: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { start_date, end_date } = req.query;
            
            const result = await merchantService.getQueueAnalytics(queue_id, {
                start_date: start_date as string,
                end_date: end_date as string,
            });
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                date_range: {
                    start: req.query.start_date,
                    end: req.query.end_date,
                },
            }),
        }
    ),
}; 