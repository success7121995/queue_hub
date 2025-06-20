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
    staff_id: z.string().min(1, "Staff ID is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    role: z.enum(["FRONTLINE", "MANAGER", "OWNER"]),
    position: z.string().min(1, "Position is required"),
    image_url: z.string().optional(),
});

export type EmployeeSchema = z.infer<typeof employeeSchema>;

export const authController = {

    /**
     * Login a user (Merchant or admin)
     * @param req - The request object
     * @param res - The response object
     */
    login: withActivityLog(
        async (req: Request, res: Response) => {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            // Set session data
            let branchId = result.merchant?.Branch[0]?.branch_id;
            if (req.session.user && req.session.user.branch_id) {
                branchId = req.session.user.branch_id;
            }

            // Get merchant role if user is a merchant
            let merchantRole: string | undefined;
            if (result.user.role === UserRole.MERCHANT && result.userMerchant) {
                merchantRole = result.userMerchant.role;
            }

            // Set session data
            req.session.user = {
                user_id: result.user.user_id,
                email: result.user.email,
                role: result.user.role,
                merchant_id: result.merchant?.merchant_id,
                branch_id: branchId,
                availableBranches: result.merchant?.Branch.map(branch => branch.branch_id) ?? [],
                merchantRole
            };
            
            // Save session explicitly
            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        reject(new AppError("Failed to save session", 500));
                    }
                    resolve();
                });
            });

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
            // Clear session
            await new Promise<void>((resolve) => {
                req.session.destroy(() => {
                    resolve();
                });
            });

            // Clear cookies
            res.clearCookie('session_id');

            res.status(200).json({ success: true });
            return null;
        },
        {
            action: ActivityType.LOGOUT_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: () => ({}),
        }
    ),

    /**
     * Get current user info
     * @param req - The request object
     * @param res - The response object
     */
    me: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user) {
                throw new AppError("Not authenticated", 401);
            }

            const userData = await authService.getUserById(user.user_id);

            res.status(200).json({
                success: true,
                user: {
                    ...userData.user
                }
            });

            return userData;
        },
        {
            action: ActivityType.VIEW_PROFILE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: () => ({}),
        }
    ),

    /**
     * Register a merchant
     * @param req - The request object
     * @param res - The response object
     */
    register: withActivityLog(
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
    )
}; 