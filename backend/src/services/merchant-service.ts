import { Merchant, Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../helpers/app-error";

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