"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const notification_utils_1 = require("../utils/notification-utils");
exports.messageService = {
    async getLastMessages(user_id) {
        const result = await prisma_1.prisma.$queryRawUnsafe(`
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
    async markMessageAsRead(message_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const message = await tx.message.update({
                where: { message_id },
                data: { is_read: true },
            });
            return message;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async getConversation(user_id, other_user_id, before, limit) {
        const take = limit ?? 10;
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const hiddenChat = await tx.hiddenChat.findUnique({
                where: {
                    user_id_other_user_id: {
                        user_id,
                        other_user_id: other_user_id
                    },
                },
            });
            const whereClause = {
                OR: [
                    { sender_id: user_id, receiver_id: other_user_id },
                    { sender_id: other_user_id, receiver_id: user_id },
                ],
            };
            if (hiddenChat) {
                whereClause.created_at = { gt: hiddenChat.updated_at };
            }
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
            const ordered = messages.slice().reverse();
            return {
                messages: ordered,
                hasMore: messages.length === take,
            };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async sendMessage(senderId, receiverId, content) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async sendMessageWithAttachment(senderId, receiverId, content, file) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async hideChat(user_id, other_user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async updateHiddenChat(user_id, other_user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.hiddenChat.update({
                where: { user_id_other_user_id: { user_id, other_user_id } },
                data: { updated_at: new Date() },
            });
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async getNotifications(user_id) {
        return await notification_utils_1.notificationUtils.getNotifications(user_id);
    },
    async updateMessageNotification(receiver_id, sender_username, message_content, sender_id) {
        const title = `${sender_username} sent you a message`;
        const content = message_content.startsWith('📎 ') ? message_content : message_content;
        const redirect_url = `/messages/${sender_id}`;
        return await notification_utils_1.notificationUtils.updateOrCreateNotification(receiver_id, title, content, redirect_url);
    },
    async deleteNotification(notification_id, user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const notification = await tx.notification.findFirst({
                where: {
                    notification_id,
                    user_id,
                },
            });
            if (!notification) {
                throw new Error("Notification not found or access denied");
            }
            await tx.notification.delete({
                where: {
                    notification_id,
                },
            });
            return { success: true };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async deleteNotificationsBySender(user_id, sender_id) {
        return await notification_utils_1.notificationUtils.deleteNotificationsBySender(user_id, sender_id);
    },
    async markNotificationAsRead(notification_id, user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const notification = await tx.notification.findFirst({
                where: {
                    notification_id,
                    user_id,
                },
            });
            if (!notification) {
                throw new Error("Notification not found or access denied");
            }
            const updatedNotification = await tx.notification.update({
                where: { notification_id },
                data: {
                    is_read: true,
                    read_at: new Date(),
                },
            });
            return updatedNotification;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async createSupportTicketNotification(user_name) {
        return await notification_utils_1.notificationUtils.createSupportTicketNotification(user_name);
    },
};
