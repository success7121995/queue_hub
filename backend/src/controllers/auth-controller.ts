import { NextFunction, Request, Response } from "express";
import { PrismaClient, User, Merchant, UserRole, UserStatus, ApprovalStatus, ActivityType, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../helpers/app-error";
import { insertActivityLog } from "../helpers/activity-log";
import { 
    checkUserExists, 
    validatePasswords, 
    hashPassword, 
    verifyPassword,
    findUserByEmail
} from "../utils/userUtils";

const prisma = new PrismaClient();

/**
 * Merchant signup
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const merchantSignup = async (req: Request, res: Response, next: NextFunction) => {
    const {
        plan, title, business_name, lname, fname, username, email, phone, password, confirm_password, lang,
        country, state, city, zip, street, unit, floor,
        card_token, save_card
    } = req.body;

    let error: string | null = null;
    let success = false;
    let result: { user: User; merchant: Merchant; } | null = null;

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
                    title,
                    username,
                    lname,
                    fname,
                    email,
                    password_hash,
                    phone,
                    role: UserRole.MERCHANT,
                    status: UserStatus.INACTIVE,
                    lang,
                }
            });

            const merchant: Merchant = await tx.merchant.create({
                data: {
                    merchant_id: uuidv4() + "-" + Date.now(),
                    owner_id: user.user_id,
                    approval_status: ApprovalStatus.PENDING,
                    business_name,
                    phone,
                    email,
                    subscription_status: plan,
                    address: {
                        create: {
                            address_id: uuidv4() + "-" + Date.now(),
                            country,
                            state,
                            city,
                            zip,
                            street,
                            unit,
                            floor
                        }
                    }
                }
            });

            return { user, merchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to create merchant", 400);
        }

        success = true;
        res.status(200).json({ message: "Merchant created successfully", success: true });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.CREATE_MERCHANT,
            userId: result?.user?.user_id || '',
            success,
            status: res.statusCode || 500,
            error,
            actionData: result || { message: 'Failed to signup merchant' }
        });
    }
}

/**
 * Login
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    let error: string | null = null;
    let result: { user: User; merchant: Merchant | null; } | null = null;
    let success = false;
    try {
        result = await prisma.$transaction(async (tx) => {
            const user = await findUserByEmail(email);

            if (!user) {
                throw new AppError("Invalid email or password", 400);
            }

            const is_password_correct = await verifyPassword(password, user.password_hash || '');

            if (!is_password_correct) {
                throw new AppError("Invalid email or password", 400);
            }

            let merchant: Merchant | null = null;

            if (user.role === UserRole.MERCHANT) {
                const userMerchant = await tx.userMerchant.findFirst({
                    where: { user_id: user.user_id },
                    include: { merchant: true }
                });

                if (!userMerchant?.merchant || userMerchant.merchant.approval_status !== ApprovalStatus.APPROVED) {
                    throw new AppError("Merchant not approved", 400);
                }

                merchant = userMerchant.merchant;
            }

            return { user, merchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to login", 400);
        }

        const safeUser = {
            userId: result.user.user_id,
            role: result.user.role,
            username: result.user.username
        }

        req.session.user = safeUser;

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: result.user,
            merchant: result.merchant,
            redirect: result.user.role === UserRole.MERCHANT
                ? `http://localhost:3000/dashboard/${result.merchant?.merchant_id}/view-live-queues`
                : '/'
        });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.LOGIN_USER,
            userId: result?.user?.user_id || '',
            success,
            status: res.statusCode || 500,
            error,
            actionData: result || { message: 'Failed to login' }
        });
    }
}

/**
 * Logout
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    let error: string | null = null;
    let success = false;

    try {
        req.session.destroy((err) => {
            if (err) {
                throw new AppError("Failed to logout", 400);
            }
    
            res.status(200).json({ message: "Logout successful", success: true });
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        next(err);
    } finally {
        await insertActivityLog({
            actionType: ActivityType.LOGOUT_USER,
            userId: req.session.user?.userId || '',
            success,
            status: res.statusCode || 500,
            error,
            actionData: req.session.user || { message: 'Failed to logout' }
        });
    }
} 