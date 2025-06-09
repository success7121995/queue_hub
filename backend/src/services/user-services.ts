import { ActivityType, Prisma, PrismaClient, User } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";

const prisma = new PrismaClient();

// Valid relations for user
export const RELATION_MAPPING: Record<string, keyof Prisma.UserInclude> = {
    merchant: "merchant",
    oauth_accounts: "oauth_accounts",
    user_merchant: "user_merchant",
    queue_entries: "queue_entries",
    favorite_merchants: "favorite_merchants",
    user_queue_reminder_references: "user_queue_reminder_references",
    password_resets: "password_resets",
    message_sent: "messages_sent",
    messages_sent: "messages_sent",
    message_received: "messages_received",
    messages_received: "messages_received",
    email_logs_sent: "email_logs_sent",
    reviews: "reviews",
    user_devices: "user_devices",
    activity_logs: "activity_logs",
};
  


/**
 * Get user by ID
 * @param userId - The ID of the user
 * @returns The user
 */
export const getUserByUserId = async (userId: string, includes: string[] = []): Promise<{ user: User }> => {
    let error: string | null = null;

    try {
        const include: Prisma.UserInclude = {};

        for (const relation of includes) {
            if (relation in RELATION_MAPPING) {
                include[RELATION_MAPPING[relation]] = true;
            }
        }

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include
        });


        if (!user) {
            throw new AppError("User not found", 404);
        }

        return { user };
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        throw new AppError(error, 500);
    }
}

/**
 * Delete User
 * @param userId - The ID of the user
 * @returns The deleted user
 */
export const deleteUserData = async (userId: string) => {
    let error: string | null = null;
    let result: { user: User } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.delete({ where: { user_id: userId } });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return { user };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        throw new AppError(error, 500);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.DELETE_USER,
            userId,
            success,
            error,
            status: 200,
            actionData: result || { message: 'Failed to delete user' },
        });
    }

    return result!;
}