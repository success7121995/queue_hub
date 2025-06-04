import { NextFunction, Request, Response } from "express";
import {
    PrismaClient,
    User,
    Merchant,
    UserRole,
    UserStatus,
    ApprovalStatus,
    ActivityType,
    Prisma,
    SubscriptionStatus,
    Lang,
    MerchantRole
} from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";
import { generateVerifyLink } from "../services/verification-services";
import { 
    checkUserExists, 
    validatePasswords, 
    hashPassword, 
    verifyPassword,
    findUserByEmail
} from "../utils/userUtils";

const prisma = new PrismaClient();
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

/**
 * Merchant signup
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const merchantSignup = async (req: Request, res: Response, next: NextFunction) => {
    const {
        plan, business_name, lname, fname, username, email, phone, password, confirm_password, lang,
        country, state, city, zip, street, unit, floor,
        card_token, save_card, auto_renewal
    }: {
        plan: SubscriptionStatus;
        business_name: string; lname: string; fname: string; username: string; email: string; phone: string;
        password: string; confirm_password: string; lang: Lang;
        country: string; state: string; city: string; zip: string; street: string; unit: string; floor: string;
        card_token: string; save_card: boolean; auto_renewal: boolean;
    } = req.body;

    let error: string | null = null;
    let success = false;
    let result: { user: User; merchant: Merchant; } | null = null;

    try {
        if (await checkUserExists(email, username, phone)) {
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
                    phone,
                    role: UserRole.MERCHANT,
                    status: UserStatus.INACTIVE,
                    lang
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
                    auto_renewal,
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
                },
            });

            const userMerchant = await tx.userMerchant.create({
                data: {
                    user_id: user.user_id,
                    merchant_id: merchant.merchant_id,
                    position: 'Owner',
                    role: MerchantRole.OWNER
                }
            });

            return { user, merchant, userMerchant };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to create merchant", 400);
        }

        // Send verification email
        console.log(result);
        // TODO: Send verification email

        success = true;
        // Generate a redirect token (in production, this should be a secure token)
        const redirect_token = uuidv4();
        
        // Store the redirect token in session
        req.session.redirect_token = redirect_token;
        
        res.status(200).json({ 
            message: "Merchant created successfully", 
            success: true, 
            redirect_token 
        });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;

        next(err instanceof AppError ? err : new AppError("Failed to signup merchant", 500));
    } finally {
        await insertActivityLog({
            actionType: ActivityType.CREATE_MERCHANT,
            userId: result?.user?.user_id || '',
            success,
            status: res.statusCode || 500,
            error,
            actionData: result || { message: 'Failed to signup merchant' },
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

                console.log(userMerchant);

                if (!userMerchant?.merchant || userMerchant.merchant.approval_status !== ApprovalStatus.APPROVED) {
                    console.log(userMerchant?.merchant.approval_status);
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
            username: result.user.username,
            merchant_id: result.merchant?.merchant_id || null
        }

        req.session.user = safeUser;
        success = true;

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: result.user,
            merchant: result.merchant,
            redirect: result.user.role === UserRole.MERCHANT
                ? `${frontendUrl}/dashboard/${result.merchant?.merchant_id}/view-live-queues`
                : `${frontendUrl}/dashboard/2a0b68db-d948-44d3-8967-ec3d106f31ff-1749016133439/view-live-queues`
        });

    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        res.status(err instanceof AppError && err.statusCode ? err.statusCode : 500);
        next(err instanceof AppError ? err : new AppError("Failed to login", 500));
    } finally {
        await insertActivityLog({
            actionType: ActivityType.LOGIN_USER,
            userId: result?.user?.user_id || '',
            success,
            status: res.statusCode,
            error,
            actionData: result || { message: 'Failed to login' },
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
    const userId = req.session.user?.userId;

    try {
        // Clear the session cookie
        res.clearCookie('session_id', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
        });

        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                error = err.message;
                success = false;
                res.status(400).json({ message: "Failed to logout", success: false });
                return;
            }
            success = true;
            res.status(200).json({ message: "Logout successful", success: true });
        });
    } catch (err) {
        error = err instanceof Error ? err.stack || err.message : JSON.stringify(err);
        success = false;
        res.status(500).json({ message: "Failed to logout", success: false });
        next(err instanceof AppError ? err : new AppError("Failed to logout", 500));
    } finally {
        if (userId) {
            await insertActivityLog({
                actionType: ActivityType.LOGOUT_USER,
                userId,
                success,
                status: res.statusCode,
                error,
                actionData: { message: success ? 'Logout successful' : 'Failed to logout' },
            });
        }
    }
}

/**
 * Verify Email
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const verifyMerchantEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { verification_token } = req.params;
}

/**
 * Handle secure redirect
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const handleRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const { redirect_token } = req.params;
    const sessionUser = req.session.user;
    const sessionRedirectToken = req.session.redirect_token;

    try {
        // Verify the redirect token matches the one in session
        if (!sessionRedirectToken || redirect_token !== sessionRedirectToken) {
            throw new AppError("Invalid redirect token", 400);
        }

        // Clear the redirect token after use
        delete req.session.redirect_token;

        // Determine target URL based on user role
        let targetPath = '/';
        
        if (sessionUser) {
            if (sessionUser.role === UserRole.MERCHANT && sessionUser.merchant_id) {
                targetPath = `/dashboard/${sessionUser.merchant_id}/view-live-queues`;
            } else if (sessionUser.role === UserRole.SUPER_ADMIN) {
                targetPath = '/admin/dashboard';
            }
        }

        // Return the full frontend URL
        res.status(200).json({ 
            success: true, 
            redirect_url: `${frontendUrl}${targetPath}`
        });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError("Failed to process redirect", 500));
    }
}

/**
 * Verify session status
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const verifySession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.session.user;
        console.log('Session user in verifySession:', user); // Debug log

        if (!user) {
            throw new AppError("No active session", 401);
        }

        // Return minimal user info needed by frontend
        const response = {
            success: true,
            user: {
                userId: user.userId,
                role: user.role,
                username: user.username,
                merchant_id: user.merchant_id,
            }
        };

        res.status(200).json(response);
    } catch (err) {
        console.error('Session verification error:', err);
        next(err instanceof AppError ? err : new AppError("Failed to verify session", 500));
    }
};