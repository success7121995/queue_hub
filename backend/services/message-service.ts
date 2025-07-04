import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const messageService = {
    /**
     * Get last messages
     */
    async getLastMessages(user_id: string) {
        const result = await prisma.$queryRawUnsafe(`
            WITH RankedMessages AS (
                SELECT 
                    m.*, 
                    u.user_id as other_user_id,
                    u.username as other_username,
                    a.image_url as other_avatar_url,
                    hc.updated_at as hidden_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
                        ORDER BY m.created_at DESC
                    ) as rn
                FROM "Message" m
                JOIN "User" u ON u.user_id = (
                    CASE
                        WHEN m.sender_id = $1 THEN m.receiver_id
                        ELSE m.sender_id
                    END
                )
                LEFT JOIN "Avatar" a ON a.user_id = u.user_id
                LEFT JOIN "HiddenChat" hc ON hc.user_id = $1 AND hc.other_user_id = u.user_id
                WHERE m.sender_id = $1 OR m.receiver_id = $1
            )
            SELECT 
                message_id, content, created_at, is_read, sender_id, receiver_id,
                other_user_id, other_username, other_avatar_url
            FROM RankedMessages 
            WHERE rn = 1
              AND (hidden_at IS NULL OR created_at > hidden_at)
            ORDER BY created_at DESC
        `, user_id);
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

    /**
     * Get all messages between two users (infinite scroll)
     */
    async getConversation(user_id: string, other_user_id: string, before?: string, limit?: number) {
        const take = limit ?? 10;
        const result = await prisma.$transaction(async (tx) => {
            // First, check if there's a hidden chat record for this user
            const hiddenChat = await tx.hiddenChat.findUnique({
                where: {
                    user_id_other_user_id: {
                        user_id,
                        other_user_id: other_user_id
                    },
                },
            });

            // Build the where clause for messages
            const whereClause: any = {
                OR: [
                    { sender_id: user_id, receiver_id: other_user_id },
                    { sender_id: other_user_id, receiver_id: user_id },
                ],
            };

            // If there's a hidden chat record, filter out messages created before the hidden chat was updated
            if (hiddenChat) {
                whereClause.created_at = { gt: hiddenChat.updated_at };
            }
            // If before is passed, filter messages where created_at < before
            if (before) {
                whereClause.created_at = whereClause.created_at
                    ? { ...whereClause.created_at, lt: before }
                    : { lt: before };
            }

            const messages = await tx.message.findMany({
                where: whereClause,
                orderBy: { created_at: "desc" },
                take,
                include: {
                    Attachment: {
                        select: {
                            attachment_id: true,
                            file_url: true,
                            created_at: true
                        }
                    }
                }
            });

            // Reverse to ascending order for frontend
            const ordered = messages.slice().reverse();
            return {
                messages: ordered,
                hasMore: messages.length === take,
            };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Send a message from user_id to receiverId
     */
    async sendMessage(senderId: string, receiverId: string, content: string) {
        const result = await prisma.$transaction(async (tx) => {        
            const message = await tx.message.create({
                data: {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                },
                include: {
                    Attachment: {
                        select: {
                            attachment_id: true,
                            file_url: true,
                            created_at: true
                        }
                    }
                }
            });

            return message;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Send a message with attachment from user_id to receiverId
     */
    async sendMessageWithAttachment(senderId: string, receiverId: string, content: string, file: Express.Multer.File) {
        const result = await prisma.$transaction(async (tx) => {        
            const message = await tx.message.create({
                data: {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                    Attachment: {
                        create: {
                            file_url: `/uploads/${file.filename}`
                        }
                    }
                },
                include: {
                    Attachment: {
                        select: {
                            attachment_id: true,
                            file_url: true,
                            created_at: true
                        }
                    }
                }
            });

            return message;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Hide chat
     */
    async hideChat(user_id: string, other_user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            await tx.hiddenChat.upsert({
                where: {
                    user_id_other_user_id: {
                        user_id,
                        other_user_id
                    }
                },
                update: {
                    updated_at: new Date()
                },
                create: {
                    user_id,
                    other_user_id,
                },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Update hidden chat record (Update updated_at)
     * @param user_id - The user ID
     * @param other_user_id - The other user ID
     * @returns The updated hidden chat record
     */
    async updateHiddenChat(user_id: string, other_user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            await tx.hiddenChat.update({
                where: { user_id_other_user_id: { user_id, other_user_id } },
                data: { updated_at: new Date() },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },
}