"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth-service");
const client_1 = require("@prisma/client");
const with_activity_log_1 = require("../utils/with-activity-log");
const app_error_1 = require("../utils/app-error");
const merchantSchema = zod_1.z.object({
    // Step 1: Signup
    signup: zod_1.z.object({
        plan: zod_1.z.enum(["TRIAL", "ESSENTIAL", "GROWTH"]),
        lang: zod_1.z.enum(["EN", "ZH", "ZH_CH"]),
        business_name: zod_1.z.string().min(1, "Business name is required"),
        fname: zod_1.z.string().min(1, "First name is required"),
        lname: zod_1.z.string().min(1, "Last name is required"),
        username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
        email: zod_1.z.string().email("Invalid email address"),
        phone: zod_1.z.string().min(1, "Phone number is required"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        use_same_address: zod_1.z.boolean().default(true),
    }),
    // Step 2: Branch Info
    branchInfo: zod_1.z.object({
        branch_name: zod_1.z.string().min(1, "Branch name is required"),
        email: zod_1.z.string().email("Invalid email address").optional(),
        phone: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
    // Step 3: Address
    address: zod_1.z.object({
        street: zod_1.z.string().min(1, "Street is required"),
        city: zod_1.z.string().min(1, "City is required"),
        state: zod_1.z.string().min(1, "State is required"),
        zip: zod_1.z.string().min(1, "ZIP code is required"),
        country: zod_1.z.string().min(1, "Country is required"),
        unit: zod_1.z.string().optional(),
        floor: zod_1.z.string().optional(),
    }),
    // Step 4: Branch Address (optional)
    branchAddress: zod_1.z.object({
        street: zod_1.z.string().min(1, "Street is required"),
        city: zod_1.z.string().min(1, "City is required"),
        state: zod_1.z.string().min(1, "State is required"),
        zip: zod_1.z.string().min(1, "ZIP code is required"),
        country: zod_1.z.string().min(1, "Country is required"),
        unit: zod_1.z.string().optional(),
        floor: zod_1.z.string().optional(),
    }).optional(),
    // Step 5: Payment
    payment: zod_1.z.object({
        save_card: zod_1.z.boolean().default(false),
        auto_renewal: zod_1.z.boolean().default(false),
    })
});
const employeeSchema = zod_1.z.object({
    fname: zod_1.z.string().min(1, "First name is required"),
    lname: zod_1.z.string().min(1, "Last name is required"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    staff_id: zod_1.z.string().min(1, "Staff ID is required").optional(),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(1, "Phone number is required"),
    role: zod_1.z.enum(["FRONTLINE", "MANAGER", "OWNER"]),
    position: zod_1.z.string().min(1, "Position is required"),
    image_url: zod_1.z.string().optional(),
});
const changePasswordSchema = zod_1.z.object({
    old_password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    new_password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
const customerSchema = zod_1.z.object({
    fname: zod_1.z.string().min(1, "First name is required"),
    lname: zod_1.z.string().min(1, "Last name is required"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(1, "Phone number is required")
});
exports.authController = {
    /**
     * Login a user (Merchant or admin)
     * @param req - The request object
     * @param res - The response object
     */
    login: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const { email, password } = req.body;
        const result = await auth_service_1.authService.login(email, password);
        if (!result) {
            throw new app_error_1.AppError("User not found", 404);
        }
        // Get merchant role if user is a merchant
        let merchantRole;
        let adminRole;
        if (result.user.role === client_1.UserRole.ADMIN && result.userAdmin) {
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
        if (result?.user.role === client_1.UserRole.MERCHANT && result.userMerchant) {
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
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    reject(new app_error_1.AppError("Failed to save session", 500));
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
    }, {
        action: client_1.ActivityType.LOGIN_USER,
        extractUserId: (req, res, result) => result?.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            email: req.body.email,
            role: result?.user?.role ?? null,
        }),
    }),
    /**
     * Logout a user
     * @param req - The request object
     * @param res - The response object
     */
    logout: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        // Clear session
        await new Promise((resolve) => {
            req.session.destroy(() => {
                resolve();
            });
        });
        // Clear cookies
        res.clearCookie('session_id');
        res.status(200).json({ success: true });
        return null;
    }, {
        action: client_1.ActivityType.LOGOUT_USER,
        extractUserId: (req) => req.user?.user_id ?? null,
        extractData: () => ({}),
    }),
    /**
     * Register a merchant
     * @param req - The request object
     * @param res - The response object
     */
    registerMerchant: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        // Validate request body against schema
        const validatedData = merchantSchema.parse(req.body);
        // Check if passwords match
        if (validatedData.signup.password !== validatedData.signup.confirm_password) {
            throw new app_error_1.AppError("Passwords do not match", 400);
        }
        // Register merchant
        const result = await auth_service_1.authService.registerMerchant(validatedData);
        // Return success response
        res.status(201).json({
            success: true,
            result
        });
        return result;
    }, {
        action: client_1.ActivityType.CREATE_MERCHANT,
        extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
        extractData: (req, res, result) => ({
            email: req.body.signup.email,
            business_name: req.body.branchInfo.business_name,
            plan: req.body.signup.plan,
        }),
    }),
    /**
     * Add new employee
     * @param req - The request object
     * @param res - The response object
     */
    addNewEmployee: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const validatedData = employeeSchema.parse(req.body);
        const user = req.session.user;
        const merchant_id = user?.merchant_id;
        console.log(validatedData);
        if (!merchant_id) {
            throw new app_error_1.AppError("Merchant ID not found", 404);
        }
        const result = await auth_service_1.authService.addNewEmployee(merchant_id, validatedData);
        res.status(201).json({
            success: true,
            result
        });
        return result;
    }, {
        action: client_1.ActivityType.CREATE_STAFF_USER,
        extractUserId: (req, res, result) => result?.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            email: req.body.email,
            role: req.body.role,
        }),
    }),
    /**
     * Change password
     */
    changePassword: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const user = req.session.user;
        if (!user?.user_id) {
            throw new app_error_1.AppError("User ID not found", 404);
        }
        const validatedData = changePasswordSchema.parse(req.body);
        if (validatedData.new_password !== validatedData.confirm_password) {
            throw new app_error_1.AppError("Passwords do not match", 400);
        }
        await auth_service_1.authService.changePassword(user.user_id, validatedData);
        res.status(200).json({
            success: true,
        });
    }, {
        action: client_1.ActivityType.CHANGE_PASSWORD,
        extractUserId: (req) => req.session.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            user_id: req.session.user?.user_id,
        }),
    }),
    /**
     * Register a customer
     * @param req - The request object
     * @param res - The response object
     */
    registerCustomer: (0, with_activity_log_1.withActivityLog)(async (req, res) => {
        const validatedData = customerSchema.parse(req.body);
        const result = await auth_service_1.authService.registerCustomer(validatedData);
        res.status(201).json({
            success: true,
            result
        });
    }, {
        action: client_1.ActivityType.CREATE_USER,
        extractUserId: (req, res, result) => result?.user?.user_id ?? null,
        extractData: (req, res, result) => ({
            email: req.body.email,
        }),
    })
};
