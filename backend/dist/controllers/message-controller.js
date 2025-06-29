"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const with_activity_log_1 = require("../utils/with-activity-log");
const message_service_1 = require("../services/message-service");
const app_error_1 = require("../utils/app-error");
exports.messageController = {
    /**
     * Get last messages
     */
    getLastMessages: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const messages = await message_service_1.messageService.getLastMessages(user_id);
        res.json({ success: true, messages });
    }),
    /**
     * Mark message as read
     */
    markMessageAsRead: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { message_id } = req.params;
        const response = await message_service_1.messageService.markMessageAsRead(message_id);
        res.json({ success: true, result: response });
    }),
    /**
     * Get conversation
     */
    getConversation: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { otherUserId } = req.params;
        if (!user_id || !otherUserId) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const messages = await message_service_1.messageService.getConversation(user_id, otherUserId);
        res.json({ success: true, messages });
    }),
    /**
     * Send message
     */
    sendMessage: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { receiverId, content } = req.body;
        if (!user_id || !receiverId || !content) {
            throw new app_error_1.AppError("Missing required fields", 400);
        }
        const message = await message_service_1.messageService.sendMessage(user_id, receiverId, content);
        res.json({ success: true, message });
    }),
    /**
     * Hide chat
     */
    hideChat: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { otherUserId } = req.params;
        if (!user_id || !otherUserId) {
            throw new app_error_1.AppError("User not found", 404);
        }
        await message_service_1.messageService.hideChat(user_id, otherUserId);
        res.json({ success: true });
    }),
    /**
     * Update hidden chat record (Update updated_at)
     */
    updateHiddenChat: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { otherUserId } = req.params;
        if (!user_id || !otherUserId) {
            throw new app_error_1.AppError("User not found", 404);
        }
        await message_service_1.messageService.updateHiddenChat(user_id, otherUserId);
        res.json({ success: true });
    }),
};
