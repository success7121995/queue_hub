import { Request, Response } from "express";
import { withActivityLog } from "../utils/with-activity-log";
import { messageService } from "../services/message-service";
import { z } from "zod";
import { AppError } from "../utils/app-error";
import { ActivityType } from "@prisma/client";

export const messageController = {
    /**
     * Get last messages
     */
    getLastMessages: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const messages = await messageService.getLastMessages(user_id);
            res.json({ success: true, messages });
        }
    ),

    /**
     * Mark message as read
     */
    markMessageAsRead: withActivityLog(
        async (req: Request, res: Response) => {
            const { message_id } = req.params;
            const response = await messageService.markMessageAsRead(message_id);
            res.json({ success: true, result: response });
        }
    ),

    /**
     * Get conversation (infinite scroll)
     */
    getConversation: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const { other_user_id } = req.params;
            const before = typeof req.query.before === 'string' ? req.query.before : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            if (!user_id || !other_user_id) {
                throw new AppError("User not found", 404);
            }
            const { messages, hasMore } = await messageService.getConversation(user_id, other_user_id, before, limit);
            res.json({ success: true, messages, hasMore });
        }
    ),

    /**
     * Send message
     */
    sendMessage: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const { receiverId, content } = req.body;
            if (!user_id || !receiverId || !content) {
                throw new AppError("Missing required fields", 400);
            }
            const message = await messageService.sendMessage(user_id, receiverId, content);
            res.json({ success: true, message });
        }
    ),

    /**
     * Hide chat
     */
    hideChat: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const { other_user_id } = req.params;

            if (!user_id || !other_user_id) {
                throw new AppError("User not found", 404);
            }

            await messageService.hideChat(user_id, other_user_id);
            res.json({ success: true });
        }
    ),

    /**
     * Update hidden chat record (Update updated_at)
     */
    updateHiddenChat: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const { other_user_id } = req.params;

            if (!user_id || !other_user_id) {
                throw new AppError("User not found", 404);
            }

            await messageService.updateHiddenChat(user_id, other_user_id);
            res.json({ success: true });
        }
    ),
};