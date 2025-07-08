import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { notificationUtils } from "../utils/notification-utils";

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

    /**
     * Get notifications for a user
     * @param user_id - The user ID
     * @returns The notifications
     */
    async getNotifications(user_id: string) {
        return await notificationUtils.getNotifications(user_id);
    },

    /**
     * Update notification for message
     * @param receiver_id - The receiver's user ID
     * @param sender_username - The sender's username
     * @param message_content - The message content
     * @param sender_id - The sender's user ID
     * @returns The notification
     */
    async updateMessageNotification(
        receiver_id: string, 
        sender_username: string, 
        message_content: string, 
        sender_id: string
    ) {
        // Determine title based on whether this is the first message or a follow-up
        const title = `${sender_username} sent you a message`;
        
        // Determine content - if it's a file attachment, show 📎 Attachment
        const content = message_content.startsWith('📎 ') ? message_content : message_content;
        
        // Create redirect URL to the chat
        const redirect_url = `/messages/${sender_id}`;
        
        return await notificationUtils.updateOrCreateNotification(
            receiver_id,
            title,
            content,
            redirect_url
        );
    },

    /**
     * Delete notification
     * @param notification_id - The notification ID
     * @param user_id - The user ID (for validation)
     * @returns Success response
     */
    async deleteNotification(notification_id: string, user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            // First, verify the notification belongs to the user
            const notification = await tx.notification.findFirst({
                where: {
                    notification_id,
                    user_id,
                },
            });

            if (!notification) {
                throw new Error("Notification not found or access denied");
            }

            // Delete the notification
            await tx.notification.delete({
                where: {
                    notification_id,
                },
            });

            return { success: true };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Delete notifications for a specific sender when user enters chat
     * @param user_id - The user ID (receiver)
     * @param sender_id - The sender's user ID
     * @returns Success response
     */
    async deleteNotificationsBySender(user_id: string, sender_id: string) {
        return await notificationUtils.deleteNotificationsBySender(user_id, sender_id);
    },
}