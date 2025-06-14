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
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: z.string().min(8, "Password must be at least 8 characters"),
        fname: z.string().min(1, "First name is required"),
        lname: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        lang: z.enum(["EN", "ZH-HK", "ZH-TW", "ZH-CN"]),
    }),

    // Step 2: Branch Info
    branchInfo: z.object({
        business_name: z.string().min(1, "Business name is required"),
        branch_name: z.string().min(1, "Branch name is required"),
        description: z.string().optional(),
        branch_phone: z.string().optional(),
        branch_email: z.string().email("Invalid email address").optional()
    }),

    // Step 3: Address
    address: z.object({
        street: z.string().min(1, "Street is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        country: z.string().min(1, "Country is required")
    }),

    // Step 4: Branch Address (optional)
    branch_address: z.object({
        street: z.string().min(1, "Street is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        country: z.string().min(1, "Country is required")
    }).optional(),

    // Step 5: Payment
    payment: z.object({
        payment_method: z.string().min(1, "Payment method is required"),
        auto_renewal: z.boolean().default(false)
    })
});

export type MerchantSchema = z.infer<typeof merchantSchema>;

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
            if (req.session.user && req.session.user.branchId) {
                branchId = req.session.user.branchId;
            }

            // Get merchant role if user is a merchant
            let merchantRole: string | undefined;
            if (result.user.role === UserRole.MERCHANT && result.userMerchant) {
                merchantRole = result.userMerchant.role;
            }

            req.session.user = {
                userId: result.user.user_id,
                email: result.user.email,
                role: result.user.role,
                merchantId: result.merchant?.merchant_id,
                branchId,
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
            if (!req.session.user && process.env.NODE_ENV === "development") {
                req.session.user = {
                    userId: "c4a1168b-9c99-454f-9c12-bf8f1ae73690-1749521360313",
                    role: "MERCHANT" as UserRole,
                    email: "joechan@gmail.com",
                    merchantId: "505815b6-346f-4664-b7de-a02eca042762-1749521360360",
                    branchId: "fdd6074f-a4af-4581-b996-acd1bb2d6915-1749521360495",
                    availableBranches: ["fdd6074f-a4af-4581-b996-acd1bb2d6915-1749521360495"],
                    merchantRole: "OWNER"
                };
            }

            if (!req.session.user) {
                throw new AppError("Not authenticated", 401);
            }

            const { userId, role, merchantId, branchId, availableBranches } = req.session.user;

            const user = await authService.getAdminOrMerchantById(
                userId,
                role as UserRole,
                merchantId,
                branchId,
                availableBranches
            );
            
            res.status(200).json({
                success: true,
                user: {
                    ...user,
                    role: req.session.user.role,
                    merchantId: req.session.user.merchantId,
                    branchId: req.session.user.branchId,
                    availableBranches: req.session.user.availableBranches
                }
            });

            return user;
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
}; 