import { Request, Response, NextFunction } from "express";
import { PrismaClient, User, UserRole, ActivityType, Prisma, ApprovalStatus, MerchantRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";
import { 
    checkUserExists, 
    validatePasswords, 
    hashPassword, 
    validateUserAccess
} from "../utils/userUtils";
import {
    getAllMerchants,
    getMerchant,
    updateMerchantData,
    deleteMerchantData
} from "../services/merchant-services";
import { deleteUserData } from "../services/user-services";

const prisma = new PrismaClient();

/**
 * View all admin users
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const viewAllAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }

    const { sort_by = 'desc', order_by = 'created_at' } = req.query as {
        sort_by: 'asc' | 'desc',
        order_by: 'username' | 'lname' | 'fname' | 'email' | 'last_login' | 'created_at' | 'updated_at'
    };

    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT_AGENT]);

    let error: string | null = null;
    let result: { users: User[]; total: number; } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const users = await tx.user.findMany({
                where: {
                    role: { in: [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT_AGENT] }
                },
                orderBy: {
                    [order_by]: sort_by === 'asc' ? 'asc' : 'desc'
                }
            });

            return { users, total: users.length };
        });

        success = true;
        res.status(200).json({ message: "Admin users fetched successfully", success: true, data: result });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    }
}

/**
 * View a single admin user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const viewAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }
    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT_AGENT]);

    const { user_id } = req.params;

    let error: string | null = null;
    let result: { user: User } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { user_id } });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return { user };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });

        success = true;
        res.status(200).json({ message: "Admin user fetched successfully", success: true, data: result });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    }
}

/**
 * Create admin user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }
    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN]);

    const {
        lname, fname, username, email, phone, password, confirm_password, lang, role
    } = req.body;

    let error: string | null = null;
    let success = false;
    let result: { user: User; } | null = null;

    try {
        if (await checkUserExists(email, username)) {
            throw new AppError("User already exists", 400);
        }

        await validatePasswords(password, confirm_password);
        const password_hash = await hashPassword(password);

        result = await prisma.$transaction(async (tx) => {
            const user: User = await tx.user.create({
                data: {
                    user_id: uuidv4() + "-" + Date.now(),
                    username,
                    lname,
                    fname,
                    email,
                    password_hash,
                    role,
                    phone,
                    lang
                }
            });

            success = true;
            return { user };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to create admin user", 400);
        }

        res.status(200).json({ message: "Admin user created successfully", success: true });

    } catch (err) {
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.CREATE_USER,
            userId: sessionUser?.userId || '',
            success,
            status: res.statusCode || 500,
            error,
            actionData: result || { message: 'Failed to create admin user' }
        });
    }
}

/**
 * Update admin user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }
    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN]);

    const {
        user_id, lname, fname, username, email, phone, lang, role
    } = req.body;

    let error: string | null = null;
    let success = false;
    let result: { user: User; } | null = null;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { user_id }
        });

        if (!existingUser) {
            throw new AppError("User not found", 400);
        }

        result = await prisma.$transaction(async (tx) => {
            const user: User = await tx.user.update({
                where: { user_id },
                data: {
                    lname, fname, username, email, phone, lang, role
                }
            });

            return { user };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        success = true;
        res.status(200).json({ message: "Admin user updated successfully", success: true });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.UPDATE_USER,
            userId: sessionUser?.userId || '',
            success: !error,
            status: res.statusCode,
            error: error || null,
            actionData: result || { message: 'Failed to update admin user' }
        });
    }
}

/**
 * Delete admin user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        return next(new AppError("Unauthorized", 401));
    }

    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN]);

    const { user_id } = req.body;

    let error: string | null = null;
    let result: { user: User } | null = null;
    let success = false;

    try {
        result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.delete({ where: { user_id } });
            return { user };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        success = true;
        res.status(200).json({ message: "Admin user deleted successfully", success: true });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.DELETE_USER,
            userId: sessionUser.userId,
            success,
            status: success ? 200 : 500,
            error,
            actionData: result || { user_id, message: "Failed to delete admin user" },
        });
    }
};

/**
 * View all merchants
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const viewAllMerchants = async (req: Request, res: Response, next: NextFunction) => {
    const { sort_by = 'desc', order_by = 'created_at' } = req.query as {
        sort_by: 'asc' | 'desc',
        order_by: 'business_name' | 'owner_name' |  'phone' | 'email' | 'last_login' | 'created_at' | 'updated_at' | 'rating'
    };

    const { merchants, total } = await getAllMerchants({ sort_by, order_by });
    res.status(200).json({ message: "Merchants fetched successfully", success: true, data: { merchants, total } });
}

/**
 * View a single merchant
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const viewMerchant = async (req: Request, res: Response, next: NextFunction) => {
    const { merchant_id } = req.params;

    const { merchant } = await getMerchant(merchant_id);
    res.status(200).json({ message: "Merchant fetched successfully", success: true, data: merchant });
}

/**
 * Update Merchant
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const updateMerchant = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }

    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.SUPPORT_AGENT]);
    const { merchant_id } = req.params;
    const { merchant } = await updateMerchantData(merchant_id, sessionUser.userId, req.body);
    res.status(200).json({ message: "Merchant updated successfully", success: true, data: merchant });
}

/**
 * Approve Merchant
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const approveMerchant = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }

    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.SUPPORT_AGENT]);
    const { merchant_id } = req.params;
    const { merchant } = await updateMerchantData(merchant_id, sessionUser.userId, { approval_status: ApprovalStatus.APPROVED });

    // Send email to merchant
    // TODO: Send email to merchant

    res.status(200).json({ message: "Merchant approved", success: true, data: merchant });
}

/**
 * Reject Merchant
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const rejectMerchant = async (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
        throw new AppError("Unauthorized", 401);
    }

    const { reason } = req.body;

    await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.SUPPORT_AGENT]);
    const { merchant_id } = req.params;
    const { merchant } = await updateMerchantData(merchant_id, sessionUser.userId, { approval_status: ApprovalStatus.REJECTED });

    // Send email to merchant
    // TODO: Send email to merchant
    console.log(reason);

    res.status(200).json({ message: "Merchant rejected", success: true, data: merchant });
}

/**
 * Delete Merchant
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const deleteMerchant = async (req: Request, res: Response, next: NextFunction) => {
    // const sessionUser = req.session.user;
    // if (!sessionUser) {
    //     throw new AppError("Unauthorized", 401);
    // }

    // await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN]);

    const { merchant_id } = req.params;
    const { merchant } = await deleteMerchantData(merchant_id, '123');

    res.status(200).json({ message: "Merchant deleted successfully", success: true, data: merchant });
}

/**
 * Delete User
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    // const sessionUser = req.session.user;
    // if (!sessionUser) {
    //     throw new AppError("Unauthorized", 401);
    // } 

    // await validateUserAccess({ role: sessionUser.role }, [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN]);

    const { user_id } = req.params;
    const { user } = await deleteUserData(user_id);

    res.status(200).json({ message: "User deleted successfully", success: true, data: user });
}