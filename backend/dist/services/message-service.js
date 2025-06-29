"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
exports.messageService = {
    /**
     * Get last messages
     */
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
    /**
     * Mark message as read
     * @param message_id - The message ID
     * @returns The message
     */
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
    /**
     * Get all messages between two users
     */
    async getConversation(user_id, otherUserId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // First, check if there's a hidden chat record for this user
            const hiddenChat = await tx.hiddenChat.findUnique({
                where: {
                    user_id_other_user_id: {
                        user_id,
                        other_user_id: otherUserId
                    }
                }
            });
            // Build the where clause for messages
            const whereClause = {
                OR: [
                    { sender_id: user_id, receiver_id: otherUserId },
                    { sender_id: otherUserId, receiver_id: user_id },
                ],
            };
            // If there's a hidden chat record, filter out messages created before the hidden chat was updated
            if (hiddenChat) {
                whereClause.created_at = {
                    gt: hiddenChat.updated_at
                };
            }
            const messages = await tx.message.findMany({
                where: whereClause,
                orderBy: { created_at: "asc" },
            });
            return messages;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    /**
     * Send a message from user_id to receiverId
     */
    async sendMessage(senderId, receiverId, content) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    message_id: (0, uuid_1.v4)(),
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                },
            });
            return message;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    /**
     * Hide chat
     */
    async hideChat(user_id, other_user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.hiddenChat.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    user_id,
                    other_user_id,
                },
            });
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    /**
     * Update hidden chat record (Update updated_at)
     */
    async updateHiddenChat(user_id, other_user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.hiddenChat.update({
                where: { user_id_other_user_id: { user_id, other_user_id } },
                data: { updated_at: new Date() },
            });
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
};
