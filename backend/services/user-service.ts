import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { User } from "@prisma/client";

interface QueueHistoryParams {
    start_date?: string;
    end_date?: string;
}

// User service
// Handles: user profile operations, queue participation logic
export const userService = {
    /**
     * Update user profile
     * @param user_id - The user ID
     * @param updateData - The data to update
     */
    async updateUserProfile(user_id: string, updateData: Partial<User>) {
        const user = await prisma.user.update({
            where: { user_id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
        });
        return { user };
    },

    /**
     * Join a queue
     * @param queue_id - The queue ID
     * @param user_id - The user ID
     */
    async joinQueue(queue_id: string, user_id: string) {
        // Get the last queue entry number
        const lastEntry = await prisma.queueEntry.findFirst({
            where: { queue_id },
            orderBy: { number: 'desc' },
        });

        const nextNumber = (lastEntry?.number ?? 0) + 1;

        // Create new queue entry
        const entry = await prisma.queueEntry.create({
            data: {
                entry_id: uuidv4(),
                queue_id,
                user_id,
                number: nextNumber,
                status: "WAITING",
                updated_at: new Date(),
            },
        });

        return { entry };
    },

    /**
     * Leave a queue
     * @param queue_id - The queue ID
     * @param user_id - The user ID
     */
    async leaveQueue(queue_id: string, user_id: string) {
        // Find the user's active queue entry
        const entry = await prisma.queueEntry.findFirst({
            where: {
                queue_id,
                user_id,
                status: "WAITING",
            },
        });

        if (!entry) {
            throw new AppError("No active queue entry found", 404);
        }

        // Update entry status to NO_SHOW
        const updatedEntry = await prisma.queueEntry.update({
            where: { entry_id: entry.entry_id },
            data: {
                status: "NO_SHOW",
                updated_at: new Date(),
            },
        });

        return { entry: updatedEntry };
    },

    /**
     * Get user's queue history
     * @param user_id - The user ID
     * @param params - The history parameters
     */
    async getQueueHistory(user_id: string, params: QueueHistoryParams) {
        const { start_date, end_date } = params;
        
        const entries = await prisma.queueEntry.findMany({
            where: {
                user_id,
                join_at: {
                    gte: start_date ? new Date(start_date) : undefined,
                    lte: end_date ? new Date(end_date) : undefined,
                },
            },
            include: {
                Queue: {
                    include: {
                        Branch: {
                            include: {
                                Merchant: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                join_at: 'desc',
            },
        });

        return { entries };
    },
}; 