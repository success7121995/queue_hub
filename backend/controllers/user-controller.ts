import { Request, Response } from "express";
import { ActivityType, MerchantRole, TicketPriority } from "@prisma/client";
import { withActivityLog } from "../utils/with-activity-log";
import { userService } from "../services/user-service";
import { geminiService } from "../services/gemini-service";
import { AppError } from "../utils/app-error";
import { z } from "zod";

const updateEmployeeSchema = z.object({
    fname: z.string().min(1, "First name is required").optional(),
    lname: z.string().min(1, "Last name is required").optional(),
    phone: z.string().min(1, "Phone number is required").optional(),
    position: z.string().min(1, "Position is required").optional(),
    role: z.nativeEnum(MerchantRole).optional(),
    staff_id: z.string().min(1, "Staff ID is required").optional(),
});

export type UpdateEmployeeData = z.infer<typeof updateEmployeeSchema>;

const createTicketSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    category: z.string().min(1, "Category is required"),
    message: z.string().min(1, "Message is required")
});
export type CreateTicketData = z.infer<typeof createTicketSchema> & {
    priority: TicketPriority;
    files?: Express.Multer.File[];
};

export const userController = {
    /**
     * Update user profile
     * @param req - The request object
     * @param res - The response object
     */
    updateProfile: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user!;

            const updateData = req.body;
            
            const result = await userService.updateUserProfile(user.user_id, updateData);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                user_id: req.params.user_id,
                updated_fields: Object.keys(req.body),
            }),
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

            const userData = await userService.getUserById(user.user_id);

            res.status(200).json({
                success: true,
                user: {
                    ...userData.user
                }
            });

            return userData;
        },
    ),

    /**
     * Get employees
     * @param req - The request object
     * @param res - The response object
     */
    getEmployees: withActivityLog(
        async (req: Request, res: Response) => {    
            const user = req.session.user;
            const merchant_id = user?.merchant_id;

            if (!merchant_id) { 
                throw new AppError("Merchant ID not found", 404);
            }

            const result = await userService.getEmployees(merchant_id);

            res.status(200).json({ success: true, result });
        },
    ),

    /**
     * Assign branches to employee
     * @param req - The request object
     * @param res - The response object
     */
    assignBranches: withActivityLog(
        async (req: Request, res: Response) => {
            const { staff_id } = req.params;
            const { branch_ids } = req.body;

            const result = await userService.assignBranches(staff_id, branch_ids);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_STAFF_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req) => ({
                staff_id: req.params.staff_id,
                branch_ids: req.body.branch_ids
            }),
        }
    ),

    /**
     * Update employee
     * @param req - The request object
     * @param res - The response object
     */
    updateEmployee: withActivityLog(
        async (req: Request, res: Response) => {
            const { staff_id } = req.params;
            const updateData = updateEmployeeSchema.parse(req.body);

            const result = await userService.updateEmployee(staff_id, updateData);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_STAFF_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req) => ({
                staff_id: req.params.staff_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Delete employee
     * @param req - The request object
     * @param res - The response object
     */
    deleteEmployee: withActivityLog(
        async (req: Request, res: Response) => {    
            const { user_id } = req.params;
            const result = await userService.deleteEmployee(user_id);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.DELETE_STAFF_USER, 
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req) => ({
                user_id: req.params.user_id,
            }),
        }
    ),

    /**
     * Upload avatar
     * @param req - The request object
     * @param res - The response object
     */
    uploadAvatar: withActivityLog(
        async (req: Request, res: Response) => {    
            const user = req.session.user;

            if (!user) {
                throw new AppError("Not authenticated", 401);
            }

            const file = (req as any).file;
            
            if (!file) {
                throw new AppError("No file uploaded", 400);
            }
            
            const image_url = `/uploads/${file.filename}`;
            const result = await userService.uploadAvatar(user.user_id, image_url);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req) => ({
                user_id: req.user?.user_id ?? null,
                image_url: (req as any).file ? `/uploads/${(req as any).file.filename}` : null,
            }),
        }
    ),

    /**
     * Delete avatar
     * @param req - The request object
     * @param res - The response object
     */
    deleteAvatar: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user) {
                throw new AppError("Not authenticated", 401);
            }

            const result = await userService.deleteAvatar(user.user_id);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req) => ({
                user_id: req.user?.user_id ?? null,
            }),
        }
    ),

    /**
     * Join a queue
     * @param req - The request object
     * @param res - The response object
     */
    joinQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { user_id } = req.user!;
            
            const result = await userService.joinQueue(queue_id, user_id);
            res.status(201).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CREATE_TICKET,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                ticket_number: result?.entry?.number,
            }),
        }
    ),

    /**
     * Leave a queue
     * @param req - The request object
     * @param res - The response object
     */
    leaveQueue: withActivityLog(
        async (req: Request, res: Response) => {
            const { queue_id } = req.params;
            const { user_id } = req.user!;
            
            const result = await userService.leaveQueue(queue_id, user_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.CLOSE_TICKET,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                queue_id: req.params.queue_id,
                ticket_number: result?.entry?.number,
            }),
        }
    ),

    /**
     * Get user's queue history
     * @param req - The request object
     * @param res - The response object
     */
    getQueueHistory: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.user!;
            const { start_date, end_date } = req.query;
            
            const result = await userService.getQueueHistory(user_id, {
                start_date: start_date as string,
                end_date: end_date as string,
            });
            res.status(200).json({ success: true, result });
            return result;
        }
    ),

    /**
     * Create a ticket
     * @param req - The request object
     * @param res - The response object
     */
    createTicket: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const validatedData = createTicketSchema.parse(req.body);
            const files = (req as any).files || [];

            // Determine priority using Gemini AI
            let priority: TicketPriority = 'MEDIUM'; // Default fallback
            try {
                priority = await geminiService.determineTicketPriority(
                    validatedData.subject,
                    validatedData.message
                );
            } catch (error) {
                console.error('Failed to determine ticket priority with Gemini:', error);
                // Continue with default priority if Gemini fails
            }

            const ticket = await userService.createTicket(user_id, {
                ...validatedData,
                priority,
                files: files
            });
            res.status(201).json({ success: true, result: { ticket_id: ticket.ticket_id } });
        },
        {
            action: ActivityType.CREATE_TICKET,
            extractUserId: (req) => req.session.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                subject: req.body.subject,
                category: req.body.category,
            }),
        }
    ),

    /**
     * Get tickets (for regular users - their own tickets only)
     * @param req - The request object
     * @param res - The response object
     */
    getTickets: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;

            const { status } = req.query;

            // Handle multiple status values
            let statusFilter: string | string[] | undefined;
            if (status) {
                if (Array.isArray(status)) {
                    statusFilter = status.map(s => String(s));
                } else {
                    statusFilter = String(status);
                }
            }
            
            // Regular users can only see their own tickets
            const result = await userService.getTickets(user_id, statusFilter, false);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_PROFILE,
            extractUserId: (req) => req.session.user?.user_id ?? null,
        }
    ),

    /**
     * Get all tickets (for admin users only)
     * @param req - The request object
     * @param res - The response object
     */
    getAllTickets: withActivityLog(
        async (req: Request, res: Response) => {
            const { user_id } = req.session.user!;
            const { status } = req.query;

            // Handle multiple status values
            let statusFilter: string | string[] | undefined;
            if (status) {
                if (Array.isArray(status)) {
                    statusFilter = status.map(s => String(s));
                } else {
                    statusFilter = String(status);
                }
            }
            
            // Admin users can see all tickets
            const result = await userService.getTickets(user_id, statusFilter, true);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_PROFILE,
            extractUserId: (req) => req.session.user?.user_id ?? null,
        }
    ),

    /**
     * Get a specific ticket
     * @param req - The request object
     * @param res - The response object
     */
    getTicket: withActivityLog(
        async (req: Request, res: Response) => {
            const { ticket_id } = req.params;
            console.log(req.params);

            const result = await userService.getTicket(ticket_id);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.VIEW_PROFILE,
            extractUserId: (req) => req.session.user?.user_id ?? null,
            extractData: (req) => ({
                ticket_id: req.params.ticket_id,
            }),
        }
    ),

    /**
     * Update a ticket
     * @param req - The request object
     * @param res - The response object
     */
    updateTicket: withActivityLog(
        async (req: Request, res: Response) => {
            const { ticket_id } = req.params;
            const updateData = req.body;

            const result = await userService.updateTicket(ticket_id, updateData);
            res.status(200).json({ success: true, result });
            return result;
        },
        {
            action: ActivityType.UPDATE_TICKET,
            extractUserId: (req) => req.session.user?.user_id ?? null,
            extractData: (req) => ({
                ticket_id: req.params.ticket_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),
}; 