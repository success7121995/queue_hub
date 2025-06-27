import { Request, Response } from "express";
import { withActivityLog } from "../utils/with-activity-log";
import { messageService } from "../services/message-service";
import { z } from "zod";
import { AppError } from "../utils/app-error";
import { ActivityType } from "@prisma/client";

export const messageController = {
    getMessagePreview: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;

            if (!user_id) {
                throw new AppError("User not found", 404);
            }

            const { limit } = req.query;

            const response = await messageService.getMessagePreview(user_id, Number(limit));
            res.json({ success: true, ...response });
        },
    ),

    markMessageAsRead: withActivityLog(
        async (req: Request, res: Response) => {
            const { message_id } = req.params;
            const response = await messageService.markMessageAsRead(message_id);
            res.json({ success: true, result: response });
        }
    ),
}