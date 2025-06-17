import { Request, Response } from "express";
import { ActivityType, Queue, Tag, Prisma, UserRole, MerchantRole, Lang } from "@prisma/client";
import { z } from "zod";
import { withActivityLog } from "../utils/with-activity-log";
import { merchantService } from "../services/merchant-service";
import { queueService } from "../services/queue-service";
import { AppError } from "../utils/app-error";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                role: string;
            };
        }
    }
}

const branchSchema = z.object({

    // Branch Information 
    branch_name: z.string().min(1, "Branch name is required"),
    phone: z.string().min(1, "Branch phone is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    description: z.string().optional(),

    // Branch Address
    address: z.object({
        country: z.string().min(1, "Country is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
    })
});

export type BranchSchema = z.infer<typeof branchSchema>;

// Validation schemas
const signupSchema = z.object({
    userInfo: z.object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        fname: z.string().min(1, "First name is required"),
        lname: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        position: z.string().min(1, "Position is required"),
        role: z.nativeEnum(MerchantRole),
        lang: z.nativeEnum(Lang),
    }),
    branchInfo: z.object({
        branch_name: z.string().min(1, "Branch name is required"),
        phone: z.string().optional(),
        email: z.string().email("Invalid email address").optional(),
        description: z.string().optional(),
        opening_hours: z.array(z.object({
            day_of_week: z.number().min(1).max(7),
            open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            is_closed: z.boolean().default(false),
        })).optional(),
    }),
    address: z.object({
        country: z.string().min(1, "Country is required"),
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        unit: z.string().optional(),
        floor: z.string().optional(),
    }),
});

// Merchant controller
// Handles: profile management, queue operations, analytics
export const merchantController = {

    /**
     * Update merchant profile
     * @param req - The request object
     * @param res - The response object
     */
    updateProfile: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;
            const updateData = req.body;
            
            const result = await merchantService.updateMerchantProfile(merchant_id, updateData);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_MERCHANT,
            extractUserId: (req, res, result) => result?.merchant?.owner_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Create a new queue
     * @param req - The request object
     * @param res - The response object
     */
    createQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user) {
                throw new AppError("User not found", 404);
            }

            const branch_id = user.branch_id as string;
            const { queue_name, tags } = req.body;
            
            const result = await merchantService.createQueue(branch_id, queue_name, tags);
            res.status(201).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CREATE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                queue_name: req.body.queue_name,
            }),
        }
    ),

    /**
     * View queues by merchant
     * @param req - The request object
     * @param res - The response object
     */
    viewQueuesByBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;

            const result = await queueService.viewQueuesByBranch(branch_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.params.merchant_id,
            }),
        }
    ),

    /**
     * Update queue details
     * @param req - The request object
     * @param res - The response object
     */
    updateQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { queue_name, tags } = req.body.data;

            const result = await merchantService.updateQueue(queue_id, queue_name, tags);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Delete a queue
     * @param req - The request object
     * @param res - The response object
     */
    deleteQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            
            const result = await merchantService.deleteQueue(queue_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.DELETE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
            }),
        }
    ),

    /**
     * View queue analytics
     * @param req - The request object
     * @param res - The response object
     */
    viewQueueAnalytics: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { start_date, end_date } = req.query;
            
            const result = await merchantService.getQueueAnalytics(queue_id, {
                start_date: start_date as string,
                end_date: end_date as string,
            });
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                date_range: {
                    start: req.query.start_date,
                    end: req.query.end_date,
                },
            }),
        }
    ),

    /**
     * Create a new branch
     * @param req - The request object
     * @param res - The response object
     */
    createBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const validatedData = branchSchema.parse(req.body);

            const result = await merchantService.createBranch(validatedData);
        },
        {
            action: ActivityType.CREATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({

            }),
        }
    )
}; 