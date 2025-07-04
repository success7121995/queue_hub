import { Server } from "socket.io";
import { merchantService } from "../services/merchant-service";
import { messageService } from "../services/message-service";
import { userService } from "../services/user-service";


const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("A user connected");

        /**
         * Handle user joining their room
         */
        socket.on("joinRoom", ({ user_id }) => {
            if (user_id) {
                socket.join(user_id);
            }
        });

        /**
         * Handle queue status changes
         */
        socket.on("openOrCloseQueue", async ({ queueId, status }) => {
            try {
                // Update queue status in database
                const queue = await merchantService.openOrCloseQueue(queueId, status);

                // Broadcast the status change to all connected clients
                io.emit("queueStatusChanged", {
                    queueId,
                    status: queue.queue.queue_status
                });
            } catch (error) {
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
            } catch (error) {
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
            } catch (error) {
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
            } catch (error) {
                console.error("Error deleting queue:", error);
                socket.emit("error", { message: "Failed to delete queue" });
            }
        });

        /**
         * Handle send message
         * @param senderId - The sender's user ID
         * @param receiverId - The receiver's user ID
         * @param content - The message content
         */
        socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
            try {
                // Send message to database
                const message = await messageService.sendMessage(senderId, receiverId, content);
                
                // Emit the new message to both users immediately
                io.to(senderId).emit("receiveMessage", message);
                io.to(receiverId).emit("receiveMessage", message);
                
                // Get updated previews for both users in parallel
                const [senderPreviews, receiverPreviews] = await Promise.all([
                    messageService.getLastMessages(senderId),
                    messageService.getLastMessages(receiverId)
                ]);
                
                // Emit updated previews to both users
                io.to(senderId).emit("messagePreviews", senderPreviews);
                io.to(receiverId).emit("messagePreviews", receiverPreviews);
                
                // Send success confirmation to sender
                socket.emit("messageSent", { success: true, message });
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("messageSent", { success: false, error: "Failed to send message" });
            }
        });

        /**
         * Handle send message with attachment (notification after HTTP upload)
         * @param message - The message object (already saved in DB)
         */
        socket.on("sendMessageWithAttachment", async ({ message }) => {
            if (message && message.sender_id && message.receiver_id) {
                io.to(message.sender_id).emit("receiveMessage", message);
                io.to(message.receiver_id).emit("receiveMessage", message);
                // Optionally, update previews for both users
                const [senderPreviews, receiverPreviews] = await Promise.all([
                    messageService.getLastMessages(message.sender_id),
                    messageService.getLastMessages(message.receiver_id)
                ]);
                io.to(message.sender_id).emit("messagePreviews", senderPreviews);
                io.to(message.receiver_id).emit("messagePreviews", receiverPreviews);
            }
        });

        /**
         * Handle mark message as read
         * @param message_id - The message ID to mark as read
         * @param user_id - The user ID
         * @param other_user_id - The other user's ID
         */
        socket.on("markMessageAsRead", async ({ message_id, user_id, other_user_id }) => {
            try {
                await messageService.markMessageAsRead(message_id);
                
                // Emit message read status update to both users
                io.to(user_id).emit("messageRead", { message_id, is_read: true });
                io.to(other_user_id).emit("messageRead", { message_id, is_read: true });
                
                // Get updated previews for both users in parallel
                const [userPreviews, otherPreviews] = await Promise.all([
                    messageService.getLastMessages(user_id),
                    messageService.getLastMessages(other_user_id)
                ]);
                
                // Emit updated previews to both users
                io.to(user_id).emit("messagePreviews", userPreviews);
                io.to(other_user_id).emit("messagePreviews", otherPreviews);
            } catch (error) {
                console.error("Error marking message as read:", error);
                socket.emit("error", { message: "Failed to mark message as read" });
            }
        });

        /**
         * Handle get last messages (previews)
         * @param user_id - The user ID
         */
        socket.on("getLastMessages", async ({ user_id }) => {
            try {
                const previews = await messageService.getLastMessages(user_id);
                socket.emit("messagePreviews", previews);
            } catch (error) {
                console.error("Error getting last messages:", error);
                socket.emit("error", { message: "Failed to get last messages" });
            }
        });

        /**
         * Handle hidden chat
         * @param user_id - The user ID
         * @param other_user_id - The other user's ID
         */
        socket.on("hideChat", async ({ user_id, other_user_id }) => {
            try {
                await messageService.hideChat(user_id, other_user_id);
                
                // Get updated previews for the user who hid the chat
                const userPreviews = await messageService.getLastMessages(user_id);
                
                // Emit updated previews to the user who hid the chat
                io.to(user_id).emit("messagePreviews", userPreviews);
            } catch (error) {
                console.error("Error hiding chat:", error);
                socket.emit("error", { message: "Failed to hide chat" });
            } 
        });

        /**
         * Handle update hidden chat
         * @param user_id - The user ID
         * @param other_user_id - The other user's ID
         */
        socket.on("updateHiddenChat", async ({ user_id, other_user_id }) => {
            try {
                await messageService.updateHiddenChat(user_id, other_user_id);
            } catch (error) {
                console.error("Error updating hidden chat:", error);
                socket.emit("error", { message: "Failed to update hidden chat" });
            }
        });

        /**
         * Create a new ticket 
         */
        socket.on("createTicket", async ({ user_id, ticket_id }) => {
            try {
                // Since the ticket is already created via HTTP, we just need to acknowledge it
                // The ticket_id parameter is used to identify the ticket that was created
                socket.emit("ticketCreated", { success: true, ticket_id });
            } catch (error) {
                console.error("Error creating ticket:", error);
                socket.emit("error", { message: "Failed to create ticket" });
            }
        });

        socket.on("getTickets", async ({ user_id }) => {
            try {
                const tickets = await userService.getTickets(user_id);
                socket.emit("tickets", tickets.tickets);
            } catch (error) {
                console.error("Error getting tickets:", error);
                socket.emit("error", { message: "Failed to get tickets" });
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

export default registerSocketHandlers;