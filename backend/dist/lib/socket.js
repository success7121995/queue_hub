"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merchant_service_1 = require("../services/merchant-service");
const message_service_1 = require("../services/message-service");
const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected");
        /**
         * Handle user joining their room
         */
        socket.on("joinRoom", ({ user_id }) => {
            if (user_id) {
                socket.join(user_id);
                console.log(`User ${user_id} joined their room`);
            }
        });
        /**
         * Handle queue status changes
         */
        socket.on("openOrCloseQueue", async ({ queueId, status }) => {
            try {
                // Update queue status in database
                const queue = await merchant_service_1.merchantService.openOrCloseQueue(queueId, status);
                // Broadcast the status change to all connected clients
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
        /**
         * Handle queue creation
         */
        socket.on("createQueue", async ({ queueName, tags }) => {
            try {
                // This would typically be handled by the HTTP endpoint
                // but we can emit a refresh event to all clients
                io.emit("queueCreated", { message: "Queue created successfully" });
            }
            catch (error) {
                console.error("Error creating queue:", error);
                socket.emit("error", { message: "Failed to create queue" });
            }
        });
        /**
         * Handle queue updates
         */
        socket.on("updateQueue", async ({ queueId, queueName, tags }) => {
            try {
                // This would typically be handled by the HTTP endpoint
                // but we can emit a refresh event to all clients
                io.emit("queueUpdated", { queueId, message: "Queue updated successfully" });
            }
            catch (error) {
                console.error("Error updating queue:", error);
                socket.emit("error", { message: "Failed to update queue" });
            }
        });
        /**
         * Handle queue deletion
         */
        socket.on("deleteQueue", async ({ queueId }) => {
            try {
                // This would typically be handled by the HTTP endpoint
                // but we can emit a refresh event to all clients
                io.emit("queueDeleted", { queueId, message: "Queue deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting queue:", error);
                socket.emit("error", { message: "Failed to delete queue" });
            }
        });
        /**
         * Handle send message
         */
        socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
            try {
                // Send message to database
                const message = await message_service_1.messageService.sendMessage(senderId, receiverId, content);
                // Emit the new message to both users immediately
                io.to(senderId).emit("receiveMessage", message);
                io.to(receiverId).emit("receiveMessage", message);
                // Get updated previews for both users in parallel
                const [senderPreviews, receiverPreviews] = await Promise.all([
                    message_service_1.messageService.getLastMessages(senderId),
                    message_service_1.messageService.getLastMessages(receiverId)
                ]);
                // Emit updated previews to both users
                io.to(senderId).emit("messagePreviews", senderPreviews);
                io.to(receiverId).emit("messagePreviews", receiverPreviews);
                // Send success confirmation to sender
                socket.emit("messageSent", { success: true, message });
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("messageSent", { success: false, error: "Failed to send message" });
            }
        });
        /**
         * Handle mark message as read
         */
        socket.on("markMessageAsRead", async ({ message_id, user_id, otherUserId }) => {
            try {
                await message_service_1.messageService.markMessageAsRead(message_id);
                // Emit message read status update to both users
                io.to(user_id).emit("messageRead", { message_id, is_read: true });
                io.to(otherUserId).emit("messageRead", { message_id, is_read: true });
                // Get updated previews for both users in parallel
                const [userPreviews, otherPreviews] = await Promise.all([
                    message_service_1.messageService.getLastMessages(user_id),
                    message_service_1.messageService.getLastMessages(otherUserId)
                ]);
                // Emit updated previews to both users
                io.to(user_id).emit("messagePreviews", userPreviews);
                io.to(otherUserId).emit("messagePreviews", otherPreviews);
            }
            catch (error) {
                console.error("Error marking message as read:", error);
                socket.emit("error", { message: "Failed to mark message as read" });
            }
        });
        /**
         * Handle get last messages (previews)
         */
        socket.on("getLastMessages", async ({ user_id }) => {
            try {
                const previews = await message_service_1.messageService.getLastMessages(user_id);
                console.log("Sending message previews to user:", user_id, previews);
                socket.emit("messagePreviews", previews);
            }
            catch (error) {
                console.error("Error getting last messages:", error);
                socket.emit("error", { message: "Failed to get last messages" });
            }
        });
        /**
         * Handle hidden chat
         */
        socket.on("hideChat", async ({ user_id, other_user_id }) => {
            try {
                await message_service_1.messageService.hideChat(user_id, other_user_id);
                // Get updated previews for the user who hid the chat
                const userPreviews = await message_service_1.messageService.getLastMessages(user_id);
                // Emit updated previews to the user who hid the chat
                io.to(user_id).emit("messagePreviews", userPreviews);
            }
            catch (error) {
                console.error("Error hiding chat:", error);
                socket.emit("error", { message: "Failed to hide chat" });
            }
        });
        /**
         * Handle update hidden chat
         */
        socket.on("updateHiddenChat", async ({ user_id, other_user_id }) => {
            try {
                await message_service_1.messageService.updateHiddenChat(user_id, other_user_id);
            }
            catch (error) {
                console.error("Error updating hidden chat:", error);
                socket.emit("error", { message: "Failed to update hidden chat" });
            }
        });
        /**
         * Handle disconnect
         */
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};
exports.default = registerSocketHandlers;
