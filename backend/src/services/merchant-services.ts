import { ActivityType, Merchant, Prisma, PrismaClient, ApprovalStatus } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";

const prisma = new PrismaClient();

type Sort = 'asc' | 'desc';

type MerchantSortOptions = {
    order_by: 'business_name' | 'owner_name' |  'phone' | 'email' | 'last_login' | 'created_at' | 'updated_at' | 'rating';
}

/**
 * Get all merchants
 * @param sort_by - The sort order
 * @param order_by - The field to sort by
 * @returns The merchants and total number of merchants
 */
export const getAllMerchants = async (query: { sort_by: Sort, order_by: MerchantSortOptions['order_by'] }): Promise<{ merchants: Merchant[]; total: number; }> => {
    const { sort_by, order_by } = query;

    let error: string | null = null;
    let result: { merchants: Merchant[]; total: number; } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const merchants = await tx.merchant.findMany({
                orderBy: {
                    [order_by]: sort_by === 'asc' ? 'asc' : 'desc'
                }
            });

            return { merchants, total: merchants.length };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        throw new AppError(error, 500);
    }

    return result;
}

/**
 * Get a single merchant
 * @param merchant_id - The ID of the merchant
 * @returns The merchant
 */
export const getMerchant = async (merchant_id: string): Promise<{ merchant: Merchant }> => {
    let error: string | null = null;
    let result: { merchant: Merchant } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.findUnique({ where: { merchant_id } });

            if (!merchant) {
                throw new AppError("Merchant not found", 404);
            }

            return { merchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        throw new AppError(error, 500);
    }

    return result;
}

/**
 * Update Merchant
 * @param merchant_id - The ID of the merchant
 * @param data - The data to update the merchant with
 * @returns The updated merchant
 */
export const updateMerchantData = async (merchant_id: string, userId: string, data: Partial<Merchant>): Promise<{ merchant: Merchant }> => {
    let error: string | null = null;
    let result: { merchant: Merchant } | null = null;
    let success = false;
    let statusCode = 200;

    try {
        result = await prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.update({
                where: { merchant_id },
                data,
            });

            if (!merchant) {
                throw new AppError("Merchant not found", 404);
            }

            return { merchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });

        success = true;
    } catch (err) {
            if (err instanceof AppError) {
            error = err.message;
            statusCode = err.statusCode ?? 500;
            throw err;
        } else {
            error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
            statusCode = 500;
            throw new AppError("Internal Server Error", 500);
        }
    } finally {
        let actionType: ActivityType;

        switch (result?.merchant?.approval_status) {
            case ApprovalStatus.APPROVED:
                actionType = ActivityType.APPROVE_MERCHANT;
                break;
            case ApprovalStatus.REJECTED:
                actionType = ActivityType.REJECT_MERCHANT;
                break;
            default:
                actionType = ActivityType.UPDATE_MERCHANT;
                break;
        }

        // Insert activity log
        await insertActivityLog({
            actionType,
            userId,
            success,
            status: statusCode,
            error,
            actionData: result || { message: 'Failed to update merchant' },
        });
    }

    return result!;
};

/**
 * Delete Merchant
 * @param merchant_id - The ID of the merchant
 * @returns The deleted merchant
 */
export const deleteMerchantData = async (merchant_id: string, userId: string): Promise<{ merchant: Merchant }> => {
    let error: string | null = null;
    let result: { merchant: Merchant } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.delete({ where: { merchant_id } });

            if (!merchant) {
                throw new AppError("Merchant not found", 404);
            }

            return { merchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        throw new AppError(error, 500);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.DELETE_MERCHANT,
            userId,
            success,
            status: 200,
            error,
            actionData: result || { message: 'Failed to delete merchant' },
        });
    }

    return result!;
}

