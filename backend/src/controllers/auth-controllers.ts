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
    MerchantRole,
    DayOfWeek,
    BranchOpeningHour
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

// Helper function to convert numeric day to DayOfWeek enum
const getDayOfWeek = (day: number): DayOfWeek => {
    switch (day) {
        case 1: return DayOfWeek.MONDAY;
        case 2: return DayOfWeek.TUESDAY;
        case 3: return DayOfWeek.WEDNESDAY;
        case 4: return DayOfWeek.THURSDAY;
        case 5: return DayOfWeek.FRIDAY;
        case 6: return DayOfWeek.SATURDAY;
        case 7: return DayOfWeek.SUNDAY;
        default: return DayOfWeek.MONDAY; // Default to Monday if invalid
    }
};

interface OpeningHourInput {
    day: number;
    open_time: string;
    close_time: string;
    is_closed?: boolean;
}

interface MerchantSignupRequest {
    signup: {
        plan?: SubscriptionStatus;
        business_name: string;
        fname: string;
        lname: string;
        username: string;
        email: string;
        phone: string;
        password: string;
        confirm_password: string;
        lang: Lang;
        use_same_address: boolean;
    };
    branchInfo: {
        branch_name: string;
        description?: string;
        email?: string;
        phone?: string;
        opening_hours?: OpeningHourInput[];
    };
    address: {
        country: string;
        state: string;
        city: string;
        zip: string;
        street: string;
        unit: string;
        floor: string;
    };
    branchAddress: {
        country: string;
        state: string;
        city: string;
        zip: string;
        street: string;
        unit: string;
        floor: string;
    };
    payment: {
        save_card: boolean;
        auto_renewal: boolean;
    };
}

/**
 * Merchant signup
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const merchantSignup = async (req: Request, res: Response, next: NextFunction) => {
    const {
        signup: {
            plan = SubscriptionStatus.TRIAL,
            business_name,
            fname,
            lname,
            username,
            email,
            phone,
            password,
            confirm_password,
            lang,
            use_same_address
        },
        branchInfo: {
            branch_name,
            description: branchDescription,
            email: branchEmail,
            phone: branchPhone,
            opening_hours: branchOpeningHours = []
        },
        address: {
            country: mainCountry,
            state: mainState,
            city: mainCity,
            zip: mainZip,
            street: mainStreet,
            unit: mainUnit,
            floor: mainFloor
        },
        branchAddress: {
            country: branchCountry,
            state: branchState,
            city: branchCity,
            zip: branchZip,
            street: branchStreet,
            unit: branchUnit,
            floor: branchFloor
        },
        payment: {
            save_card,
            auto_renewal
        },
    }: MerchantSignupRequest = req.body;

    console.log('Merchant signup request:', {
        signup: { ...req.body.signup, password: '[REDACTED]', confirm_password: '[REDACTED]' },
        branchInfo: req.body.branchInfo,
        address: req.body.address,
        branchAddress: req.body.branchAddress,
        payment: req.body.payment
    });

    let error: string | null = null;
    let success = false;
    let result: { user: User; merchant: Merchant; } | null = null;

    try {
        // Validate required fields
        if (!business_name || !fname || !lname || !username || !email || !phone || !password || !confirm_password) {
            throw new AppError("Missing required fields", 400);
        }

        if (await checkUserExists(email, username, phone)) {
            throw new AppError("User already exists", 400);
        }

        await validatePasswords(password, confirm_password);
        const password_hash = await hashPassword(password);

        // If use_same_address is true, use main address for branch
        const finalBranchAddress = use_same_address ? {
            country: mainCountry,
            state: mainState,
            city: mainCity,
            zip: mainZip,
            street: mainStreet,
            unit: mainUnit,
            floor: mainFloor
        } : {
            country: branchCountry,
            state: branchState,
            city: branchCity,
            zip: branchZip,
            street: branchStreet,
            unit: branchUnit,
            floor: branchFloor
        };

        result = await prisma.$transaction(async (tx) => {
            // Use branchOpeningHours from the destructured branchInfo
            const openingHours = branchOpeningHours;
            // Create user
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
                    lang,
                    email_verified: false
                }
            });

            // Create merchant with address
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
                            country: mainCountry,
                            state: mainState,
                            city: mainCity,
                            zip: mainZip,
                            street: mainStreet,
                            unit: mainUnit,
                            floor: mainFloor
                        }
                    }
                },
            });

            // Create branch (without address)
            const branch = await tx.branch.create({
                data: {
                    branch_id: uuidv4() + "-" + Date.now(),
                    merchant_id: merchant.merchant_id,
                    branch_name,
                    description: branchDescription,
                    phone: branchPhone || phone,
                    email: branchEmail || email,
                    is_active: true
                }
            });

            // Create branch address, linked to both branch and merchant
            const branchAddressRecord = await tx.address.create({
                data: {
                    address_id: uuidv4() + "-" + Date.now(),
                    merchant_id: merchant.merchant_id,
                    branch_id: branch.branch_id,
                    country: finalBranchAddress.country,
                    state: finalBranchAddress.state,
                    city: finalBranchAddress.city,
                    zip: finalBranchAddress.zip,
                    street: finalBranchAddress.street,
                    unit: finalBranchAddress.unit,
                    floor: finalBranchAddress.floor
                }
            });

            // Create opening hours for the branch
            if (openingHours && openingHours.length > 0) {
                for (const hour of openingHours) {
                    await tx.branchOpeningHour.create({
                        data: {
                            id: uuidv4() + "-" + Date.now(),
                            branch_id: branch.branch_id,
                            day_of_week: getDayOfWeek(hour.day),
                            open_time: new Date(`1970-01-01T${hour.open_time}`),
                            close_time: new Date(`1970-01-01T${hour.close_time}`),
                            is_closed: hour.is_closed || false
                        }
                    });
                }
            } else {
                // Default opening hours if none provided
                await tx.branchOpeningHour.create({
                    data: {
                        id: uuidv4() + "-" + Date.now(),
                        branch_id: branch.branch_id,
                        day_of_week: DayOfWeek.MONDAY,
                        open_time: new Date('1970-01-01T09:00:00'),
                        close_time: new Date('1970-01-01T17:00:00'),
                        is_closed: false
                    }
                });
            }

            // Create user-merchant relationship
            const userMerchant = await tx.userMerchant.create({
                data: {
                    user_id: user.user_id,
                    merchant_id: merchant.merchant_id,
                    position: 'Owner',
                    role: MerchantRole.OWNER
                }
            });

            return { user, merchant, userMerchant, branch, branchAddressRecord };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });

        if (!result) {
            throw new AppError("Failed to create merchant", 400);
        }

        // TODO: Send verification email
        // TODO: Handle payment processing if save_card is true

        success = true;
        const redirect_token = uuidv4();
        req.session.redirect_token = redirect_token;
        
        res.status(200).json({ 
            message: "Merchant created successfully", 
            success: true, 
            redirect_token,
            merchant_id: result.merchant.merchant_id
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
            actionData: result ? {
                merchant_id: result.merchant.merchant_id,
                business_name: result.merchant.business_name,
                email: result.merchant.email
            } : { message: 'Failed to signup merchant' },
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
            redirect: "/dashboard/view-live-queues"
        });

    } catch (err) {
        console.log('asdasdas');
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

        if (!user) {
            return res.status(200).json({
                success: true,
                user: null
            });
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