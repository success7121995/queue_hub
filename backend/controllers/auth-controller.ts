import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth-service";
import { ActivityType, Prisma, UserRole } from "@prisma/client";
import { withActivityLog } from "../utils/with-activity-log";
import { AppError } from "../utils/app-error";

const merchantSchema = z.object({
    // Step 1: Signup
    signup: z.object({
        plan: z.enum(["TRIAL", "ESSENTIAL", "GROWTH"]),
        lang: z.enum(["EN", "ZH", "ZH_CH"]),
        business_name: z.string().min(1, "Business name is required"),
        fname: z.string().min(1, "First name is required"),
        lname: z.string().min(1, "Last name is required"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: z.string().min(8, "Password must be at least 8 characters"),
        use_same_address: z.boolean().default(true),
    }),

    // Step 2: Branch Info
    branchInfo: z.object({
        branch_name: z.string().min(1, "Branch name is required"),
        email: z.string().email("Invalid email address").optional(),
        phone: z.string().optional(),
        description: z.string().optional(),
    }),

    // Step 3: Address
    address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        country: z.string().min(1, "Country is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
    }),

    // Step 4: Branch Address (optional)
    branchAddress: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        country: z.string().min(1, "Country is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
    }).optional(),

    // Step 5: Payment
    payment: z.object({
        save_card: z.boolean().default(false),
        auto_renewal: z.boolean().default(false),
    })
});

export type MerchantSchema = z.infer<typeof merchantSchema>;

const employeeSchema = z.object({
    fname: z.string().min(1, "First name is required"),
    lname: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters"),
    staff_id: z.string().min(1, "Staff ID is required").optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    role: z.enum(["FRONTLINE", "MANAGER", "OWNER"]),
    position: z.string().min(1, "Position is required"),
    image_url: z.string().optional(),
});

export type EmployeeSchema = z.infer<typeof employeeSchema>;

const adminSchema = z.object({
    fname: z.string().min(1, "First name is required"),
    lname: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters"),
    admin_id: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    role: z.enum(["SUPER_ADMIN", "OPS_ADMIN", "DEVELOPER", "SUPPORT_AGENT"]),
    position: z.string().min(1, "Position is required"),
    image_url: z.string().optional(),
    supervisor_id: z.string().min(1, "Supervisor is required"),
});

export type AdminSchema = z.infer<typeof adminSchema>;

const changePasswordSchema = z.object({
    old_password: z.string().min(8, "Password must be at least 8 characters"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

const customerSchema = z.object({
    fname: z.string().min(1, "First name is required"),
    lname: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required")
});

export type CustomerSchema = z.infer<typeof customerSchema>;

export const authController = {
    /**
     * Add new admin
     * @param req - The request object
     * @param res - The response object
     */
    addNewAdmin: withActivityLog(
        async (req: Request, res: Response) => {
            console.log('req.body: ' + req.body);
            const validatedData = adminSchema.parse(req.body);
            console.log('validatedData: ' + validatedData);
            
            if (!validatedData.supervisor_id) {
                throw new AppError("Supervisor is required", 400);
            }

            const result = await authService.addNewAdmin(validatedData);

            res.status(201).json({
                success: true,
                result
            });

            return result;
        },
        {
            action: ActivityType.CREATE_STAFF_USER,
            extractUserId: (req, res, result) => result?.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                email: req.body.email,
                role: req.body.role,
            }),
        }
    ),

    /**
     * Get unique username
     * @param req - The request object
     * @param res - The response object
     */
    checkUniqueUsernameAndEmail: withActivityLog(
        async (req: Request, res: Response) => {
            const { username, email } = req.query;
            let result = {
                isUniqueUsername: false,
                isUniqueEmail: false,
            };

            if (username) {
                const isUniqueUsername = await authService.getUniqueUsername(username as string);
                result.isUniqueUsername = isUniqueUsername;
            }

            if (email) {
                const isUniqueEmail = await authService.getUniqueEmail(email as string);
                result.isUniqueEmail = isUniqueEmail;
            }

            res.status(200).json({ success: true, result });
            return result;
        },
    ),

    /**
     * Login a user (Merchant or admin)
     * @param req - The request object
     * @param res - The response object
     */
    login: withActivityLog(
        async (req: Request, res: Response) => {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            if (!result) {
                throw new AppError("User not found", 404);
            }

            // Get merchant role if user is a merchant
            let merchantRole: string | undefined;
            let adminRole: string | undefined;

            if (result.user.role === UserRole.ADMIN && result.userAdmin) {
                adminRole = result.userAdmin.role;

                // Set session data
                req.session.user = {
                    user_id: result.user.user_id,
                    email: result.user.email,
                    role: result.user.role,
                    adminRole,
                    admin_id: result.userAdmin?.admin_id,
                };
            }

            if (result?.user.role === UserRole.MERCHANT && result.userMerchant) {
                merchantRole = result.userMerchant.role;

                // Set session data
                req.session.user = {
                    user_id: result.user.user_id,
                    email: result.user.email,
                    role: result.user.role,
                    merchant_id: result.merchant?.merchant_id,
                    merchantRole,
                };
            }

            // Save session explicitly
            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        reject(new AppError("Failed to save session", 500));
                    }
                    resolve();
                });
            });

            // Set session_id cookie (matches session middleware)
            const isProduction = process.env.NODE_ENV === 'production';
            const cookieOptions = {
                path: '/',
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                domain: isProduction ? '.queuehub.app' : undefined,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
            } as const;
            res.cookie('session_id', req.session.id, cookieOptions);

            res.status(200).json({ 
                success: true, 
                result,
                sessionId: req.session.id 
            });

            return result;
        },
        {
            action: ActivityType.LOGIN_USER,
            extractUserId: (req, res, result) => result?.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                email: req.body.email,
                user_id: result?.user?.user_id ?? null,
                role: result?.user?.role ?? null,
            }),
        }
    ),

    /**
     * Logout a user
     * @param req - The request object
     * @param res - The response object
     */
    logout: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user?.user_id) {
                throw new AppError("User ID not found", 404);
            }

            // Clear session
            await new Promise<void>((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        reject(new AppError("Failed to destroy session", 500));
                    }
                    resolve();
                });
            });

            // Clear cookies with matching options
            const isProduction = process.env.NODE_ENV === 'production';
            const cookieOptions = {
                path: '/',
                secure: isProduction,
                sameSite: isProduction ? 'none' as const : 'lax' as const,
                domain: isProduction ? '.queuehub.app' : undefined
            };

            res.clearCookie('session_id', cookieOptions);
            res.clearCookie('role', cookieOptions);
            res.clearCookie('user_id', cookieOptions);

            // Fallback: also clear without domain, sameSite, or secure (for localhost/dev)
            res.clearCookie('session_id', { path: '/' });
            res.clearCookie('role', { path: '/' });
            res.clearCookie('user_id', { path: '/' });

            res.status(200).json({ success: true, user });
            return user;
        },
        {
            action: ActivityType.LOGOUT_USER,
            extractUserId: (req, res, result) => {                
                return result?.user_id ?? null;
            },
        }
    ),

    /**
     * Register a merchant
     * @param req - The request object
     * @param res - The response object
     */
    registerMerchant: withActivityLog(
        async (req: Request<{}, {}, MerchantSchema>, res: Response) => {
            // Validate request body against schema
            const validatedData = merchantSchema.parse(req.body);

            // Check if passwords match
            if (validatedData.signup.password !== validatedData.signup.confirm_password) {
                throw new AppError("Passwords do not match", 400);
            }

            // Register merchant
            const result = await authService.registerMerchant(validatedData);

            // Return success response
            res.status(201).json({
                success: true,
                result
            });
            return result;
        },
        {
            action: ActivityType.CREATE_MERCHANT,
            extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
            extractData: (req, res, result) => ({
                email: req.body.signup.email,
                business_name: req.body.branchInfo.business_name,
                plan: req.body.signup.plan,
            }),
        }
    ),

    /**
     * Add new employee
     * @param req - The request object
     * @param res - The response object
     */
    addNewEmployee: withActivityLog(
        async (req: Request, res: Response) => {
            const validatedData = employeeSchema.parse(req.body);
            const user = req.session.user;

            const merchant_id = user?.merchant_id;

            if (!merchant_id) {
                throw new AppError("Merchant ID not found", 404);
            }

            const result = await authService.addNewEmployee(merchant_id, validatedData);

            res.status(201).json({
                success: true,
                result
            });

            return result;
        },
        {
            action: ActivityType.CREATE_STAFF_USER,
            extractUserId: (req, res, result) => result?.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                email: req.body.email,
                role: req.body.role,
            }),
        }
    ),

    /**
     * Change password
     */
    changePassword: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user?.user_id) {
                throw new AppError("User ID not found", 404);
            }

            const validatedData = changePasswordSchema.parse(req.body);

            if (validatedData.new_password !== validatedData.confirm_password) {
                throw new AppError("Passwords do not match", 400);
            }

            await authService.changePassword(user.user_id, validatedData);

            res.status(200).json({
                success: true,
            });
        },
        {
            action: ActivityType.CHANGE_PASSWORD,
            extractUserId: (req) => req.session.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                user_id: req.session.user?.user_id,
            }),
        }
    ),

    /**
     * Register a customer
     * @param req - The request object
     * @param res - The response object
     */
    registerCustomer: withActivityLog(
        async (req: Request, res: Response) => {
            const validatedData = customerSchema.parse(req.body);

            const result = await authService.registerCustomer(validatedData);

            res.status(201).json({
                success: true,
                result
            }); 
        },
        {
            action: ActivityType.CREATE_USER,
            extractUserId: (req, res, result) => result?.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                email: req.body.email,
            }),
        }
    )
}; 