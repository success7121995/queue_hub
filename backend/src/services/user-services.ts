import { ActivityType, Prisma, PrismaClient, User } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";

const prisma = new PrismaClient();

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