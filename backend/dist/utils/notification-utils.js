"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationUtils = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
exports.notificationUtils = {
    async getNotifications(user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const notifications = await tx.notification.findMany({
                where: { user_id },
                orderBy: { created_at: "desc" },
            });
            return notifications;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async updateOrCreateNotification(user_id, title, content, redirect_url, existingNotificationId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            let notification;
            if (existingNotificationId) {
                notification = await tx.notification.update({
                    where: { notification_id: existingNotificationId },
                    data: {
                        title,
                        content,
                        redirect_url,
                        is_read: false,
                        read_at: null,
                        created_at: new Date(),
                    },
                });
            }
            else {
                const existingNotification = await tx.notification.findFirst({
                    where: {
                        user_id,
                        title: {
                            contains: title.split(' ')[0],
                        },
                        is_read: false,
                    },
                    orderBy: { created_at: "desc" },
                });
                if (existingNotification) {
                    notification = await tx.notification.update({
                        where: { notification_id: existingNotification.notification_id },
                        data: {
                            title,
                            content,
                            redirect_url,
                            is_read: false,
                            read_at: null,
                            created_at: new Date(),
                        },
                    });
                }
                else {
                    notification = await tx.notification.create({
                        data: {
                            user_id,
                            title,
                            content,
                            redirect_url,
                        },
                    });
                }
            }
            return notification;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async markNotificationAsRead(notification_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const notification = await tx.notification.update({
                where: { notification_id },
                data: {
                    is_read: true,
                    read_at: new Date(),
                },
            });
            return notification;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async getUnreadCount(user_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const count = await tx.notification.count({
                where: {
                    user_id,
                    is_read: false,
                },
            });
            return count;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async deleteNotificationsBySender(user_id, sender_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const deletedCount = await tx.notification.deleteMany({
                where: {
                    user_id,
                    redirect_url: `/messages/${sender_id}`,
                },
            });
            return { success: true, deletedCount: deletedCount.count };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async getAdminsByRoles(roles) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const admins = await tx.user.findMany({
                where: {
                    role: "ADMIN",
                    status: "ACTIVE",
                    UserAdmin: {
                        role: {
                            in: roles,
                        },
                    },
                },
                select: {
                    user_id: true,
                    username: true,
                    fname: true,
                    lname: true,
                    email: true,
                    UserAdmin: {
                        select: {
                            role: true,
                            position: true,
                        },
                    },
                },
            });
            return admins;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async createAdminNotifications(roles, title, content, redirect_url) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const admins = await tx.user.findMany({
                where: {
                    role: "ADMIN",
                    status: "ACTIVE",
                    UserAdmin: {
                        role: {
                            in: roles,
                        },
                    },
                },
                select: {
                    user_id: true,
                },
            });
            const notifications = await Promise.all(admins.map(admin => tx.notification.create({
                data: {
                    user_id: admin.user_id,
                    title,
                    content,
                    redirect_url,
                },
            })));
            return notifications;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
    async createSupportTicketNotification(user_name) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const admins = await tx.user.findMany({
                where: {
                    role: "ADMIN",
                    status: "ACTIVE",
                },
                select: {
                    user_id: true,
                },
            });
            const notifications = await Promise.all(admins.map(admin => tx.notification.create({
                data: {
                    user_id: admin.user_id,
                    title: "New Support Ticket Submitted",
                    content: `${user_name} submitted a new support ticket`,
                    redirect_url: "/admin/unresolved-tickets",
                },
            })));
            return notifications;
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    },
};
