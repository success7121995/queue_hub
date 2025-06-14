import { Request, Response } from "express";
import { ActivityType } from "@prisma/client";
import { withActivityLog } from "../utils/with-activity-log";
import { userService } from "../services/user-service";

export const userController = {
    /**
     * Update user profile
     * @param req - The request object
     * @param res - The response object
     */
    updateProfile: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.params;
            const updateData = req.body;
            
            const result = await userService.updateUserProfile(user_id, updateData);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                user_id: req.params.user_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Join a queue
     * @param req - The request object
     * @param res - The response object
     */
    joinQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { user_id } = req.user!;
            
            const result = await userService.joinQueue(queue_id, user_id);
            res.status(201).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CREATE_TICKET,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                ticket_number: result?.entry?.number,
            }),
        }
    ),

    /**
     * Leave a queue
     * @param req - The request object
     * @param res - The response object
     */
    leaveQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { user_id } = req.user!;
            
            const result = await userService.leaveQueue(queue_id, user_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CLOSE_TICKET,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                ticket_number: result?.entry?.number,
            }),
        }
    ),

    /**
     * Get user's queue history
     * @param req - The request object
     * @param res - The response object
     */
    getQueueHistory: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.user!;
            const { start_date, end_date } = req.query;
            
            const result = await userService.getQueueHistory(user_id, {
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
                date_range: {
                    start: req.query.start_date,
                    end: req.query.end_date,
                },
                queue_count: result?.entries?.length ?? 0,
            }),
        }
    ),
}; 