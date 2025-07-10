"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merchant_service_1 = require("../services/merchant-service");
const message_service_1 = require("../services/message-service");
const user_service_1 = require("../services/user-service");
const prisma_1 = require("./prisma");
const notification_utils_1 = require("../utils/notification-utils");
const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected");
        socket.on("joinRoom", ({ user_id }) => {
            if (user_id) {
                console.log("User joined room:", user_id);
                socket.join(user_id);
            }
        });
        socket.on("openOrCloseQueue", async ({ queueId, status }) => {
            try {
                const queue = await merchant_service_1.merchantService.openOrCloseQueue(queueId, status);
                io.emit("queueStatusChanged", {
                    queueId,
                    status: queue.queue.queue_status
                });
            }
            catch (error) {
                console.error("Error updating queue status:", error);
                socket.emit("error", { message: "Failed to update queue status" });
            }
        });
        socket.on("createQueue", async ({ queueName, tags }) => {
            try {
                io.emit("queueCreated", { message: "Queue created successfully" });
            }
            catch (error) {
                console.error("Error creating queue:", error);
                socket.emit("error", { message: "Failed to create queue" });
            }
        });
        socket.on("updateQueue", async ({ queueId, queueName, tags }) => {
            try {
                io.emit("queueUpdated", { queueId, message: "Queue updated successfully" });
            }
            catch (error) {
                console.error("Error updating queue:", error);
                socket.emit("error", { message: "Failed to update queue" });
            }
        });
        socket.on("deleteQueue", async ({ queueId }) => {
            try {
                io.emit("queueDeleted", { queueId, message: "Queue deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting queue:", error);
                socket.emit("error", { message: "Failed to delete queue" });
            }
        });
        socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
            try {
                const message = await message_service_1.messageService.sendMessage(senderId, receiverId, content);
                io.to(senderId).emit("receiveMessage", message);
                io.to(receiverId).emit("receiveMessage", message);
                const [senderPreviews, receiverPreviews] = await Promise.all([
                    message_service_1.messageService.getLastMessages(senderId),
                    message_service_1.messageService.getLastMessages(receiverId)
                ]);
                io.to(senderId).emit("messagePreviews", senderPreviews);
                io.to(receiverId).emit("messagePreviews", receiverPreviews);
                try {
                    const sender = await prisma_1.prisma.user.findUnique({
                        where: { user_id: senderId },
                        select: { username: true, fname: true, lname: true }
                    });
                    if (sender) {
                        const senderUsername = sender.username || `${sender.fname} ${sender.lname}`.trim();
                        await message_service_1.messageService.updateMessageNotification(receiverId, senderUsername, content, senderId);
                        const [notifications, unreadCount] = await Promise.all([
                            message_service_1.messageService.getNotifications(receiverId),
                            notification_utils_1.notificationUtils.getUnreadCount(receiverId)
                        ]);
                        io.to(receiverId).emit("notificationUpdate", {
                            notifications,
                            unreadCount
                        });
                    }
                }
                catch (notificationError) {
                    console.error("Error creating notification:", notificationError);
                }
                socket.emit("messageSent", { success: true, message });
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("messageSent", { success: false, error: "Failed to send message" });
            }
        });
        socket.on("sendMessageWithAttachment", async ({ message }) => {
            if (message && message.sender_id && message.receiver_id) {
                io.to(message.sender_id).emit("receiveMessage", message);
                io.to(message.receiver_id).emit("receiveMessage", message);
                const [senderPreviews, receiverPreviews] = await Promise.all([
                    message_service_1.messageService.getLastMessages(message.sender_id),
                    message_service_1.messageService.getLastMessages(message.receiver_id)
                ]);
                io.to(message.sender_id).emit("messagePreviews", senderPreviews);
                io.to(message.receiver_id).emit("messagePreviews", receiverPreviews);
                try {
                    const sender = await prisma_1.prisma.user.findUnique({
                        where: { user_id: message.sender_id },
                        select: { username: true, fname: true, lname: true }
                    });
                    if (sender) {
                        const senderUsername = sender.username || `${sender.fname} ${sender.lname}`.trim();
                        const content = message.content || "📎 Attachment";
                        await message_service_1.messageService.updateMessageNotification(message.receiver_id, senderUsername, content, message.sender_id);
                        const [notifications, unreadCount] = await Promise.all([
                            message_service_1.messageService.getNotifications(message.receiver_id),
                            notification_utils_1.notificationUtils.getUnreadCount(message.receiver_id)
                        ]);
                        io.to(message.receiver_id).emit("notificationUpdate", {
                            notifications,
                            unreadCount
                        });
                    }
                }
                catch (notificationError) {
                    console.error("Error creating notification:", notificationError);
                }
            }
        });
        socket.on("markMessageAsRead", async ({ message_id, user_id, other_user_id }) => {
            try {
                await message_service_1.messageService.markMessageAsRead(message_id);
                io.to(user_id).emit("messageRead", { message_id, is_read: true });
                io.to(other_user_id).emit("messageRead", { message_id, is_read: true });
                const [userPreviews, otherPreviews] = await Promise.all([
                    message_service_1.messageService.getLastMessages(user_id),
                    message_service_1.messageService.getLastMessages(other_user_id)
                ]);
                io.to(user_id).emit("messagePreviews", userPreviews);
                io.to(other_user_id).emit("messagePreviews", otherPreviews);
            }
            catch (error) {
                console.error("Error marking message as read:", error);
                socket.emit("error", { message: "Failed to mark message as read" });
            }
        });
        socket.on("getLastMessages", async ({ user_id }) => {
            try {
                const previews = await message_service_1.messageService.getLastMessages(user_id);
                socket.emit("messagePreviews", previews);
            }
            catch (error) {
                console.error("Error getting last messages:", error);
                socket.emit("error", { message: "Failed to get last messages" });
            }
        });
        socket.on("hideChat", async ({ user_id, other_user_id }) => {
            try {
                await message_service_1.messageService.hideChat(user_id, other_user_id);
                const userPreviews = await message_service_1.messageService.getLastMessages(user_id);
                io.to(user_id).emit("messagePreviews", userPreviews);
            }
            catch (error) {
                console.error("Error hiding chat:", error);
                socket.emit("error", { message: "Failed to hide chat" });
            }
        });
        socket.on("updateHiddenChat", async ({ user_id, other_user_id }) => {
            try {
                await message_service_1.messageService.updateHiddenChat(user_id, other_user_id);
            }
            catch (error) {
                console.error("Error updating hidden chat:", error);
                socket.emit("error", { message: "Failed to update hidden chat" });
            }
        });
        socket.on("createTicket", async ({ user_id, ticket_id }) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({
                    where: { user_id },
                    select: { fname: true, lname: true, username: true }
                });
                if (user) {
                    const user_name = user.username || `${user.fname} ${user.lname}`.trim();
                    await message_service_1.messageService.createSupportTicketNotification(user_name);
                    const admins = await prisma_1.prisma.user.findMany({
                        where: {
                            role: "ADMIN",
                            status: "ACTIVE",
                        },
                        select: {
                            user_id: true,
                        },
                    });
                    for (const admin of admins) {
                        const [adminNotifications, unreadCount] = await Promise.all([
                            message_service_1.messageService.getNotifications(admin.user_id),
                            notification_utils_1.notificationUtils.getUnreadCount(admin.user_id)
                        ]);
                        io.to(admin.user_id).emit("notificationUpdate", {
                            notifications: adminNotifications,
                            unreadCount
                        });
                    }
                }
                socket.emit("ticketCreated", { success: true, ticket_id });
            }
            catch (error) {
                console.error("Error creating ticket:", error);
                socket.emit("error", { message: "Failed to create ticket" });
            }
        });
        socket.on("getTickets", async ({ user_id }) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({
                    where: { user_id },
                    select: { role: true }
                });
                const isAdmin = user?.role === 'ADMIN';
                const tickets = await user_service_1.userService.getTickets(user_id, undefined, isAdmin);
                socket.emit("tickets", tickets.tickets);
            }
            catch (error) {
                console.error("Error getting tickets:", error);
                socket.emit("error", { message: "Failed to get tickets" });
            }
        });
        socket.on("getNotifications", async ({ user_id }) => {
            try {
                const [notifications, unreadCount] = await Promise.all([
                    message_service_1.messageService.getNotifications(user_id),
                    notification_utils_1.notificationUtils.getUnreadCount(user_id)
                ]);
                socket.emit("notificationUpdate", { notifications, unreadCount });
            }
            catch (error) {
                console.error("Error getting notifications:", error);
                socket.emit("error", { message: "Failed to get notifications" });
            }
        });
        socket.on("deleteNotification", async ({ notification_id, user_id }) => {
            try {
                await message_service_1.messageService.deleteNotification(notification_id, user_id);
                const [notifications, unreadCount] = await Promise.all([
                    message_service_1.messageService.getNotifications(user_id),
                    notification_utils_1.notificationUtils.getUnreadCount(user_id)
                ]);
                io.to(user_id).emit("notificationUpdate", { notifications, unreadCount });
                socket.emit("notificationDeleted", { success: true, notification_id });
            }
            catch (error) {
                console.error("Error deleting notification:", error);
                socket.emit("error", { message: "Failed to delete notification" });
            }
        });
        socket.on("markNotificationAsRead", async ({ notification_id, user_id }) => {
            try {
                await message_service_1.messageService.markNotificationAsRead(notification_id, user_id);
                const [notifications, unreadCount] = await Promise.all([
                    message_service_1.messageService.getNotifications(user_id),
                    notification_utils_1.notificationUtils.getUnreadCount(user_id)
                ]);
                io.to(user_id).emit("notificationUpdate", { notifications, unreadCount });
                socket.emit("notificationMarkedAsRead", { success: true, notification_id });
            }
            catch (error) {
                console.error("Error marking notification as read:", error);
                socket.emit("error", { message: "Failed to mark notification as read" });
            }
        });
        socket.on("enterChatRoom", async ({ user_id, sender_id }) => {
            try {
                await message_service_1.messageService.deleteNotificationsBySender(user_id, sender_id);
                const [notifications, unreadCount] = await Promise.all([
                    message_service_1.messageService.getNotifications(user_id),
                    notification_utils_1.notificationUtils.getUnreadCount(user_id)
                ]);
                io.to(user_id).emit("notificationUpdate", { notifications, unreadCount });
                socket.emit("chatRoomEntered", { success: true, sender_id });
            }
            catch (error) {
                console.error("Error entering chat room:", error);
                socket.emit("error", { message: "Failed to enter chat room" });
            }
        });
        socket.on("merchantSignupNotification", async ({ merchant_name, merchant_id }) => {
            try {
                const notifications = await notification_utils_1.notificationUtils.createAdminNotifications(["SUPER_ADMIN", "OPS_ADMIN", "SUPPORT_AGENT"], "New Merchant Registration", `"${merchant_name}" has requested to join.`, "/admin/approve-merchants");
                const admins = await notification_utils_1.notificationUtils.getAdminsByRoles([
                    "SUPER_ADMIN",
                    "OPS_ADMIN",
                    "SUPPORT_AGENT"
                ]);
                for (const admin of admins) {
                    const [adminNotifications, unreadCount] = await Promise.all([
                        notification_utils_1.notificationUtils.getNotifications(admin.user_id),
                        notification_utils_1.notificationUtils.getUnreadCount(admin.user_id)
                    ]);
                    io.to(admin.user_id).emit("notificationUpdate", {
                        notifications: adminNotifications,
                        unreadCount
                    });
                }
                socket.emit("merchantSignupNotificationSent", {
                    success: true,
                    merchant_id,
                    notifiedAdmins: admins.length
                });
            }
            catch (error) {
                console.error("Error sending merchant signup notification:", error);
                socket.emit("error", { message: "Failed to send merchant signup notification" });
            }
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};
exports.default = registerSocketHandlers;
