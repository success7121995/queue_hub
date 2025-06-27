import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const messageService = {
    /**
     * Get message preview
     * @param user_id - The user ID
     * @param limit - The limit of messages to return
     * @returns The message preview
     */
    async getMessagePreview(user_id: string, limit: number = 5) {
        const result = await prisma.$transaction(async (tx) => {
            const messages = await tx.message.findMany({
                where: {
                    OR: [{ sender_id: user_id }, { receiver_id: user_id }],
                },
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
            });

            const messagePreviews = messages.map((message) => ({
                message_id: message.message_id,
                content: message.content,
                created_at: message.created_at,
                is_read: message.is_read,
            }));

            return { messagePreviews };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },

    /**
     * Mark message as read
     * @param message_id - The message ID
     * @returns The message
     */
    async markMessageAsRead(message_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const message = await tx.message.update({
                where: { message_id },
                data: { is_read: true },
            });
            return message;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },
}