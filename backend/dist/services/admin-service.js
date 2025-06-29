"use strict";
// Admin service
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const prisma_1 = require("../lib/prisma");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
exports.adminService = {
    // Will implement merchant, user management, and analytics functions
    /**
     * Activity log
     * @param action - The action to log
     * @param user_id - The user ID to log the activity for
     * @returns The activity log
     */
    async createActivityLog({ action, action_data, success, error, status, user_id, }) {
        const activityLog = await prisma_1.prisma.activityLog.create({
            data: {
                log_id: (0, uuid_1.v4)(),
                user_id: user_id ?? null,
                action,
                action_data,
                success,
                error,
                status,
            }
        });
        return activityLog;
    },
    /**
     * API log
     * @param method - The method of the API
     * @param endpoint - The endpoint of the API
     * @param status - The status of the API
     * @param response_time - The response time of the API
     * @param ip_address - The IP address of the API
     * @param user_agent - The user agent of the API
     * @param error - The error of the API
     * @returns The API log
     */
    async createAPILog(method, endpoint, status, response_time, ip_address, user_agent, error, user_id) {
        const apiLog = await prisma_1.prisma.aPILog.create({
            data: {
                log_id: (0, uuid_1.v4)(),
                method,
                endpoint,
                status,
                response_time,
                ip_address,
                user_agent,
                error: error ?? null,
                user_id: user_id ?? null,
            }
        });
        return apiLog;
    },
    /**
     * Approve a merchant
     * @param merchant_id - The merchant ID
     */
    async approveMerchant(merchant_id) {
        const merchant = await prisma_1.prisma.merchant.update({
            where: { merchant_id },
            data: {
                approval_status: client_1.ApprovalStatus.APPROVED,
                approved_at: new Date(),
                updated_at: new Date(),
            },
        });
        return { merchant };
    },
    /**
     * Reject a merchant
     * @param merchant_id - The merchant ID
     * @param reason - The rejection reason
     */
    async rejectMerchant(merchant_id, reason) {
        const merchant = await prisma_1.prisma.merchant.update({
            where: { merchant_id },
            data: {
                approval_status: client_1.ApprovalStatus.REJECTED,
                updated_at: new Date(),
            },
        });
        return { merchant, reason };
    },
    /**
     * Suspend a user
     * @param user_id - The user ID
     * @param reason - The suspension reason
     */
    async suspendUser(user_id, reason) {
        const user = await prisma_1.prisma.user.update({
            where: { user_id },
            data: {
                status: client_1.UserStatus.SUSPENDED,
                updated_at: new Date(),
            },
        });
        return { user, reason };
    },
    /**
     * Change user role
     * @param user_id - The user ID
     * @param role - The new role
     */
    async changeUserRole(user_id, role) {
        const user = await prisma_1.prisma.user.update({
            where: { user_id },
            data: {
                role,
                updated_at: new Date(),
            },
        });
        return { user };
    },
    /**
     * Get system analytics
     * @param params - The analytics parameters
     */
    async getSystemAnalytics(params) {
        const { start_date, end_date } = params;
        // Get date range
        const start = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        const end = end_date ? new Date(end_date) : new Date();
        // Get various metrics
        const [totalMerchants, activeMerchants, totalUsers, activeUsers, totalQueues, totalQueueEntries, completedEntries, noShows,] = await Promise.all([
            // Total merchants
            prisma_1.prisma.merchant.count(),
            // Active merchants
            prisma_1.prisma.merchant.count({
                where: {
                    approval_status: client_1.ApprovalStatus.APPROVED,
                    subscription_status: { not: "EXPIRED" },
                },
            }),
            // Total users
            prisma_1.prisma.user.count(),
            // Active users
            prisma_1.prisma.user.count({
                where: {
                    status: client_1.UserStatus.ACTIVE,
                    last_login: { gte: start },
                },
            }),
            // Total queues
            prisma_1.prisma.queue.count({
                where: {
                    created_at: { gte: start, lte: end },
                },
            }),
            // Total queue entries
            prisma_1.prisma.queueEntry.count({
                where: {
                    join_at: { gte: start, lte: end },
                },
            }),
            // Completed entries
            prisma_1.prisma.queueEntry.count({
                where: {
                    status: "DONE",
                    completed_at: { gte: start, lte: end },
                },
            }),
            // No-shows
            prisma_1.prisma.queueEntry.count({
                where: {
                    status: "NO_SHOW",
                    updated_at: { gte: start, lte: end },
                },
            }),
        ]);
        // Calculate metrics
        const metrics = {
            total_merchants: totalMerchants,
            active_merchants: activeMerchants,
            merchant_approval_rate: totalMerchants > 0 ? (activeMerchants / totalMerchants) * 100 : 0,
            total_users: totalUsers,
            active_users: activeUsers,
            user_activity_rate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
            total_queues: totalQueues,
            total_queue_entries: totalQueueEntries,
            completed_entries: completedEntries,
            no_shows: noShows,
            queue_completion_rate: totalQueueEntries > 0 ? (completedEntries / totalQueueEntries) * 100 : 0,
            no_show_rate: totalQueueEntries > 0 ? (noShows / totalQueueEntries) * 100 : 0,
        };
        return { metrics };
    },
};
