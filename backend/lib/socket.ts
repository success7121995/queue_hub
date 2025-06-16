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

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};

export default registerSocketHandlers;