import { PrismaClient, ActivityType, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "./app-error";

const prisma = new PrismaClient();

/**
 * Create an activity log
 * @param params - The parameters for the activity log 
 * @param tx - The transaction to use
 */ 
export const insertActivityLog = async (
    params: {
        actionType: ActivityType;
        userId: string | null;
        success: boolean;
        status: number;
        error?: string | null;
        actionData?: any;
    },
    tx = prisma
) => {
    try {

        const result = await prisma.$transaction(async (tx) => {
            const activityLog = await tx.activityLog.create({
                data: {
                    log_id: uuidv4() + "-" + Date.now(),
                    action: params.actionType,
                    action_data: params.actionData,
                    user_id: params.userId,
                    success: params.success,
                    status: params.status,
                    error: params.error
                }
            })
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });

        return result;
    } catch (error) {
        throw new AppError("Failed to create activity log", 400);
    } finally {
        await prisma.$disconnect();
    }
};
