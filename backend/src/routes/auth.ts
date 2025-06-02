import { Router, Request, Response } from "express";
import { AppError } from "../helpers/error-hander";
import { insertActivityLog } from "../helpers/activity-log";
import { PrismaClient, ActivityType, Title, UserRole, UserStatus, Lang, ApprovalStatus, SubscriptionStatus, User, Merchant, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();
const prisma = new PrismaClient();

/**
 * Merchant Signup
 */
router.post("/merchant/signup", async (req: Request, res: Response) => {
    const {
        // Signup
        plan, title, business_name, lname, fname, username, email, phone, password, confirm_password, lang,
      
        // Address
        country, state, city, zip, street, unit, floor,
      
        card_token, save_card
    }: {
        plan: SubscriptionStatus; title: Title; business_name: string; lname: string; fname: string;
        username: string; email: string; phone: string; password: string; confirm_password: string; lang: Lang;
        
        country: string; state: string; city: string; zip: string; street: string; unit: string; floor: string;

        card_token: string; // Stripe card token
        save_card: boolean;

    } = req.body;

    let error: string | null = null;
    let result: {
        user: User;
        merchant: Merchant;
    } | null = null;

    console.log(password, confirm_password);

    try {
        // Check if the user already exists by email or username
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
                username
            }
        });

        if (existingUser) {
            throw new AppError("User already exists", 400);
        }

        // Check if the password and confirm_password match
        if (password !== confirm_password) {
            throw new AppError("Password and confirm password do not match", 400);
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        if (!password_hash) {
            throw new AppError("Failed to hash password", 400);
        }

        // Start Transaction
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
    
            // Create the merchant
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

            return {
                user,
                merchant
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to create merchant", 400);
        }

        // Send email to merchant
        // TODO: Send email to merchant

        // Send email to admin
        // TODO: Send email to admin

        // Return success
        res.status(200).json({ message: "Merchant created successfully", success: true });

    } catch (err) {
        console.error(err);
        error = err instanceof AppError ? err.message : "An unknown error occurred";
        res.status(err instanceof AppError ? err.statusCode : 500).json({ message: error, success: false });
    } finally {  
        await insertActivityLog({
            actionType: ActivityType.CREATE_MERCHANT,
            userId: result?.user?.user_id || '',
            success: !error,
            status: res.statusCode,
            error: error || null,
            actionData: result || {
                message: 'Failed to signup merchant'
            }
        });
    }
});

/**
 * Merchant or Admin Login
 */
router.post('/login', async (req: Request, res: Response) => {
    const {
        email, password
    }: {
        email: string; password: string;
    } = req.body;

    let error: string | null = null;
    let result: {
        user: User;
        merchant: Merchant | null;
    } | null = null;

    try {

        // Start Transaction
        result = await prisma.$transaction(async (tx) => {
            // Check if the user exists
            const user = await tx.user.findUnique({
                where: {
                    email,
                }
            });

            if (!user) {
                throw new AppError("Invalid email or password", 400);
            }

            // Check if the password is correct
            const is_password_correct = await bcrypt.compare(password, user.password_hash || '');

            if (!is_password_correct) {
                throw new AppError("Invalid email or password", 400);
            }

            // Check if the user is a merchant, if so, check if the merchant is approved
            let merchant: Merchant | null = null;

            if (user.role === UserRole.MERCHANT) {
                const userMerchant = await tx.userMerchant.findFirst({
                    where: { user_id: user.user_id },
                    include: { merchant: true }
                });

                // Check if the merchant is approved
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

        // Set the user in the session
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
        console.error(err);
        error = err instanceof AppError ? err.message : "An unknown error occurred";
        res.status(err instanceof AppError ? err.statusCode : 500).json({ message: error, success: false });
    } finally {
        await insertActivityLog({
            actionType: ActivityType.LOGIN_USER,
            userId: result?.user?.user_id || '',
            success: !error,
            status: res.statusCode,
            error: error || null,
            actionData: result || { message: 'Failed to login' }
        });
    }
});

/**
 * Merchant Logout
 */
router.post('/logout', async (req: Request, res: Response) => {
    let error: string | null = null;

    try {
        req.session.destroy((err) => {
            if (err) {
                throw new AppError("Failed to logout", 400);
            }
    
            res.status(200).json({ message: "Logout successful", success: true });
        });
    } catch (err) {
        console.error(err);
        error = err instanceof AppError ? err.message : "An unknown error occurred";
        res.status(err instanceof AppError ? err.statusCode : 500).json({ message: error, success: false });
    } finally {
        await insertActivityLog({
            actionType: ActivityType.LOGOUT_USER,
            userId: req.session.user?.userId || '',
            success: !error,
            status: res.statusCode,
            error: error || null,
        });
    }
});


export default router;