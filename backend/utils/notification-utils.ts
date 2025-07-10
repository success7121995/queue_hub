import { prisma } from "../lib/prisma";
import { Prisma, AdminRole } from "@prisma/client";

/**
 * Shared notification utilities that can be used across different services
 */
export const notificationUtils = {
    /**
     * Get notifications for a user
     * @param user_id - The user ID
     * @returns The notifications
     */
    async getNotifications(user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const notifications = await tx.notification.findMany({
                where: { user_id },
                orderBy: { created_at: "desc" },
            });
            return notifications;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Update or create a notification for a user
     * @param user_id - The user ID
     * @param title - The notification title
     * @param content - The notification content
     * @param redirect_url - The redirect URL (optional)
     * @param existingNotificationId - If provided, update this specific notification instead of searching by title
     * @returns The notification
     */
    async updateOrCreateNotification(
        user_id: string, 
        title: string, 
        content: string, 
        redirect_url?: string,
        existingNotificationId?: string
    ) {
        const result = await prisma.$transaction(async (tx) => {
            let notification;

            if (existingNotificationId) {
                // Update existing notification by ID
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
            } else {
                // Try to find existing unread notification with similar title
                const existingNotification = await tx.notification.findFirst({
                    where: {
                        user_id,
                        title: {
                            contains: title.split(' ')[0], // Check if title starts with the same username
                        },
                        is_read: false,
                    },
                    orderBy: { created_at: "desc" },
                });

                if (existingNotification) {
                    // Update existing notification
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
                } else {
                    // Create new notification
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
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Mark notification as read
     * @param notification_id - The notification ID
     * @returns The updated notification
     */
    async markNotificationAsRead(notification_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const notification = await tx.notification.update({
                where: { notification_id },
                data: {
                    is_read: true,
                    read_at: new Date(),
                },
            });
            return notification;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Get unread notification count for a user
     * @param user_id - The user ID
     * @returns The count of unread notifications
     */
    async getUnreadCount(user_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.notification.count({
                where: {
                    user_id,
                    is_read: false,
                },
            });
            return count;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Delete notifications for a specific sender (when user opens chat)
     * @param user_id - The user ID (receiver)
     * @param sender_id - The sender's user ID
     * @returns Success response
     */
    async deleteNotificationsBySender(user_id: string, sender_id: string) {
        const result = await prisma.$transaction(async (tx) => {
            // Delete notifications that redirect to this sender's chat
            const deletedCount = await tx.notification.deleteMany({
                where: {
                    user_id,
                    redirect_url: `/messages/${sender_id}`,
                },
            });
            return { success: true, deletedCount: deletedCount.count };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Get admins by specific roles
     * @param roles - Array of admin roles to filter by
     * @returns Array of admin users with their roles
     */
    async getAdminsByRoles(roles: AdminRole[]) {
        const result = await prisma.$transaction(async (tx) => {
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
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Create notifications for all admins with specific roles
     * @param roles - Array of admin roles to notify
     * @param title - The notification title
     * @param content - The notification content
     * @param redirect_url - The redirect URL (optional)
     * @returns Array of created notifications
     */
    async createAdminNotifications(
        roles: AdminRole[],
        title: string,
        content: string,
        redirect_url?: string
    ) {
        const result = await prisma.$transaction(async (tx) => {
            // Get admins with specified roles
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

            // Create notifications for all eligible admins
            const notifications = await Promise.all(
                admins.map((admin: any) =>
                    tx.notification.create({
                        data: {
                            user_id: admin.user_id,
                            title,
                            content,
                            redirect_url,
                        },
                    })
                )
            );

            return notifications;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },

    /**
     * Create support ticket notification for all admins
     * @param user_name - The name of the user who submitted the ticket
     * @returns Array of created notifications
     */
    async createSupportTicketNotification(user_name: string) {
        const result = await prisma.$transaction(async (tx) => {
            // Get all active admins (all admin roles)
            const admins = await tx.user.findMany({
                where: {
                    role: "ADMIN",
                    status: "ACTIVE",
                },
                select: {
                    user_id: true,
                },
            });

            // Create notifications for all admins
            const notifications = await Promise.all(
                admins.map((admin: any) =>
                    tx.notification.create({
                        data: {
                            user_id: admin.user_id,
                            title: "New Support Ticket Submitted",
                            content: `${user_name} submitted a new support ticket`,
                            redirect_url: "/admin/unresolved-tickets",
                        },
                    })
                )
            );

            return notifications;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    },
}; 