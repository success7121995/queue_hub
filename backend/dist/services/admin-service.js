"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
const addYears = (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
};
exports.adminService = {
    async createActivityLog({ action, action_data, success, error, status, user_id, }) {
        const activityLog = await prisma_1.prisma.activityLog.create({
            data: {
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
    async createAPILog(method, endpoint, status, response_time, ip_address, user_agent, error, user_id) {
        const apiLog = await prisma_1.prisma.aPILog.create({
            data: {
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
    async approveMerchant(merchant_id, approval_status) {
        const updateData = {
            approval_status,
            updated_at: new Date(),
        };
        if (approval_status === client_1.ApprovalStatus.APPROVED) {
            const merchant = await prisma_1.prisma.merchant.findUnique({
                where: { merchant_id },
                select: { subscription_status: true }
            });
            updateData.approved_at = new Date();
            updateData.subscription_start = new Date();
            switch (merchant?.subscription_status) {
                case "TRIAL":
                    updateData.subscription_end = addDays(new Date(), 30);
                    break;
                case "ESSENTIAL":
                    updateData.subscription_end = addYears(new Date(), 1);
                    break;
                case "GROWTH":
                    updateData.subscription_end = addYears(new Date(), 1);
                    break;
                default:
                    updateData.subscription_start = null;
                    updateData.subscription_end = null;
                    break;
            }
        }
        const merchant = await prisma_1.prisma.merchant.update({
            where: { merchant_id },
            data: updateData,
        });
        return { merchant };
    },
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
    async getSystemAnalytics(params) {
        const { start_date, end_date } = params;
        const start = start_date ? new Date(start_date) : addDays(new Date(), -30);
        const end = end_date ? new Date(end_date) : new Date();
        const [totalMerchants, activeMerchants, totalUsers, activeUsers, totalQueues, totalQueueEntries, completedEntries, noShows,] = await Promise.all([
            prisma_1.prisma.merchant.count(),
            prisma_1.prisma.merchant.count({
                where: {
                    approval_status: client_1.ApprovalStatus.APPROVED,
                    subscription_status: { not: "EXPIRED" },
                },
            }),
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({
                where: {
                    status: client_1.UserStatus.ACTIVE,
                    last_login: { gte: start },
                },
            }),
            prisma_1.prisma.queue.count({
                where: {
                    created_at: { gte: start, lte: end },
                },
            }),
            prisma_1.prisma.queueEntry.count({
                where: {
                    join_at: { gte: start, lte: end },
                },
            }),
            prisma_1.prisma.queueEntry.count({
                where: {
                    status: "DONE",
                    completed_at: { gte: start, lte: end },
                },
            }),
            prisma_1.prisma.queueEntry.count({
                where: {
                    status: "NO_SHOW",
                    updated_at: { gte: start, lte: end },
                },
            }),
        ]);
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
    async getAdmins() {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const admins = await tx.user.findMany({
                where: { role: client_1.UserRole.ADMIN },
                select: {
                    user_id: true,
                    username: true,
                    fname: true,
                    lname: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    last_login: true,
                    Avatar: {
                        select: {
                            image_url: true,
                        },
                    },
                    UserAdmin: {
                        select: {
                            admin_id: true,
                            role: true,
                            position: true,
                            supervisor_id: true,
                        },
                    },
                },
            });
            return admins;
        });
        return result;
    },
};
