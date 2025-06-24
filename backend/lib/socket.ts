import { Server } from "socket.io";
import { prisma } from "./prisma";
import { merchantService } from "../services/merchant-service";


const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("A user connected");

        // Handle queue status changes
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

        // Handle queue creation
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

        // Handle queue updates
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

        // Handle queue deletion
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

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};

export default registerSocketHandlers;