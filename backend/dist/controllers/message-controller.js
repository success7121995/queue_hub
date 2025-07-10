"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const with_activity_log_1 = require("../utils/with-activity-log");
const message_service_1 = require("../services/message-service");
const app_error_1 = require("../utils/app-error");
const notification_utils_1 = require("../utils/notification-utils");
exports.messageController = {
    getLastMessages: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const messages = await message_service_1.messageService.getLastMessages(user_id);
        res.json({ success: true, messages });
    }),
    markMessageAsRead: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { message_id } = req.params;
        const response = await message_service_1.messageService.markMessageAsRead(message_id);
        res.json({ success: true, result: response });
    }),
    getConversation: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { other_user_id } = req.params;
        const before = typeof req.query.before === 'string' ? req.query.before : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        if (!user_id || !other_user_id) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const { messages, hasMore } = await message_service_1.messageService.getConversation(user_id, other_user_id, before, limit);
        res.json({ success: true, messages, hasMore });
    }),
    sendMessage: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { receiverId, content } = req.body;
        if (!user_id || !receiverId || !content) {
            throw new app_error_1.AppError("Missing required fields", 400);
        }
        const message = await message_service_1.messageService.sendMessage(user_id, receiverId, content);
        res.json({ success: true, message });
    }),
    sendMessageWithAttachment: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { receiverId, content } = req.body;
        const file = req.file;
        if (!user_id || !receiverId || (!content && !file)) {
            throw new app_error_1.AppError("Missing required fields", 400);
        }
        if (!file) {
            throw new app_error_1.AppError("No file uploaded", 400);
        }
        const message = await message_service_1.messageService.sendMessageWithAttachment(user_id, receiverId, content || '', file);
        res.json({ success: true, message });
    }),
    hideChat: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { other_user_id } = req.params;
        if (!user_id || !other_user_id) {
            throw new app_error_1.AppError("User not found", 404);
        }
        await message_service_1.messageService.hideChat(user_id, other_user_id);
        res.json({ success: true });
    }),
    updateHiddenChat: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const { other_user_id } = req.params;
        if (!user_id || !other_user_id) {
            throw new app_error_1.AppError("User not found", 404);
        }
        await message_service_1.messageService.updateHiddenChat(user_id, other_user_id);
        res.json({ success: true });
    }),
    getNotifications: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { user_id } = req.session.user;
        const notifications = await message_service_1.messageService.getNotifications(user_id);
        res.json({ success: true, notifications });
    }),
    markNotificationAsRead: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { notification_id } = req.params;
        const { user_id } = req.session.user;
        if (!notification_id) {
            throw new app_error_1.AppError("Notification ID is required", 400);
        }
        await notification_utils_1.notificationUtils.markNotificationAsRead(notification_id);
        res.json({ success: true });
    }),
    deleteNotification: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { notification_id } = req.params;
        const { user_id } = req.session.user;
        if (!notification_id) {
            throw new app_error_1.AppError("Notification ID is required", 400);
        }
        await message_service_1.messageService.deleteNotification(notification_id, user_id);
        res.json({ success: true });
    }),
};
