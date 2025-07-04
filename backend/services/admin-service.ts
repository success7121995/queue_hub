// Admin service

import { prisma } from "../lib/prisma";
import { ActivityType, ApprovalStatus, UserRole, UserStatus } from "@prisma/client";

/**
 * Helper function to add days to a date, handling month variations correctly
 * @param date - The base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Helper function to add months to a date, handling month variations correctly
 * @param date - The base date
 * @param months - Number of months to add
 * @returns New date with months added
 */
const addMonths = (date: Date, months: number): Date =>  {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

/**
 * Helper function to add years to a date, handling leap years correctly
 * @param date - The base date
 * @param years - Number of years to add
 * @returns New date with years added
 */
const addYears = (date: Date, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

interface ActivityLogData {
    action: ActivityType;
    action_data: any;
    success: boolean;
    status: number;
    error: string | null;
    user_id: string | null;
}

interface SystemAnalyticsParams {
    start_date?: string;
    end_date?: string;
}

export const adminService = {
    // Will implement merchant, user management, and analytics functions

    /**
     * Activity log
     * @param action - The action to log
     * @param user_id - The user ID to log the activity for
     * @returns The activity log
     */
    async createActivityLog({
        action,
        action_data,
        success,
        error,
        status,
        user_id,
    }: ActivityLogData) {
        const activityLog = await prisma.activityLog.create({
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
    async createAPILog(method: string, endpoint: string, status: number, response_time: number, ip_address: string, user_agent: string, error?: string | null, user_id?: string | null) {
        const apiLog = await prisma.aPILog.create({
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

    /**
     * Approve or reject a merchant
     * @param merchant_id - The merchant ID
     * @param approval_status - The approval status (APPROVED or REJECTED)
     */
    async approveMerchant(merchant_id: string, approval_status: ApprovalStatus) {
        const updateData: any = {
            approval_status,
            updated_at: new Date(),
        };
        
        // Only set approved_at if approving
        if (approval_status === ApprovalStatus.APPROVED) {

            const merchant = await prisma.merchant.findUnique({
                where: { merchant_id },
                select: { subscription_status: true }
            })

            updateData.approved_at = new Date();
            updateData.subscription_start = new Date();

            switch (merchant?.subscription_status) {
                case "TRIAL":
                    updateData.subscription_end = addDays(new Date(), 30); // 30 days from now
                    break;
                case "ESSENTIAL":
                    updateData.subscription_end = addYears(new Date(), 1); // 1 year from now
                    break;
                case "GROWTH":
                    updateData.subscription_end = addYears(new Date(), 1); // 1 year from now
                    break;
                default:
                    updateData.subscription_start = null;
                    updateData.subscription_end = null;
                    break;
            }
                
        }
        
        const merchant = await prisma.merchant.update({
            where: { merchant_id },
            data: updateData,
        });

        return { merchant };
    },

    /**
     * Suspend a user
     * @param user_id - The user ID
     * @param reason - The suspension reason
     */
    async suspendUser(user_id: string, reason: string) {
        const user = await prisma.user.update({
            where: { user_id },
            data: {
                status: UserStatus.SUSPENDED,
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
    async changeUserRole(user_id: string, role: UserRole) {
        const user = await prisma.user.update({
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
    async getSystemAnalytics(params: SystemAnalyticsParams) {
        const { start_date, end_date } = params;
        
        // Get date range
        const start = start_date ? new Date(start_date) : addDays(new Date(), -30); // Default to last 30 days
        const end = end_date ? new Date(end_date) : new Date();

        // Get various metrics
        const [
            totalMerchants,
            activeMerchants,
            totalUsers,
            activeUsers,
            totalQueues,
            totalQueueEntries,
            completedEntries,
            noShows,
        ] = await Promise.all([
            // Total merchants
            prisma.merchant.count(),
            // Active merchants
            prisma.merchant.count({
                where: {
                    approval_status: ApprovalStatus.APPROVED,
                    subscription_status: { not: "EXPIRED" },
                },
            }),
            // Total users
            prisma.user.count(),
            // Active users
            prisma.user.count({
                where: {
                    status: UserStatus.ACTIVE,
                    last_login: { gte: start },
                },
            }),
            // Total queues
            prisma.queue.count({
                where: {
                    created_at: { gte: start, lte: end },
                },
            }),
            // Total queue entries
            prisma.queueEntry.count({
                where: {
                    join_at: { gte: start, lte: end },
                },
            }),
            // Completed entries
            prisma.queueEntry.count({
                where: {
                    status: "DONE",
                    completed_at: { gte: start, lte: end },
                },
            }),
            // No-shows
            prisma.queueEntry.count({
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

    /**
     * Get all admins
     */
    async getAdmins() {
        const result = await prisma.$transaction(async (tx) => {
            const admins = await tx.user.findMany({
                where: { role: UserRole.ADMIN },
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