import { Request, Response } from "express";
import { ActivityType, Queue, Tag, Prisma, UserRole, MerchantRole, Lang, TagEntity } from "@prisma/client";
import { z } from "zod";
import { withActivityLog } from "../utils/with-activity-log";
import { merchantService } from "../services/merchant-service";
import { queueService } from "../services/queue-service";
import { AppError } from "../utils/app-error";
import { userService } from "../services/user-service";

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
    contact_person_id: z.string().min(1, "Contact person is required"),
    phone: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().min(1, "Branch phone is required").optional()
    ),
    email: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().email("Invalid email address").optional()
    ),
    description: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
});

export type BranchSchema = z.infer<typeof branchSchema>;

const addressSchema = z.object({
    country: z.string().min(1, "Country is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),
    unit: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
    floor: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
});

export type AddressSchema = z.infer<typeof addressSchema>;

const branchFeatureSchema = z.object({
    feature_name: z.string().min(1, "Feature name is required"),
});
export type BranchFeatureSchema = z.infer<typeof branchFeatureSchema>;

const branchTagSchema = z.object({
    entity_id: z.string().min(1, "Entity ID is required"),
    entity_type: z.nativeEnum(TagEntity).default(TagEntity.MERCHANT),
    tag_name: z.string().min(1, "Tag name is required"),
});

export type BranchTagSchema = z.infer<typeof branchTagSchema>;

const branchOpeningHourSchema = z.object({
    day_of_week: z.number().min(1).max(7),
    open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    is_closed: z.boolean().default(false),
});

export type BranchOpeningHourSchema = z.infer<typeof branchOpeningHourSchema>;

const branchImageSchema = z.object({
    logo: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
    feature_image: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
    galleries: z.array(z.string()).optional(),
});

export type BranchImageSchema = z.infer<typeof branchImageSchema>;

// Schema for creating a branch with address
const createBranchSchema = z.object({
    branch_name: z.string().min(1, "Branch name is required"),
    contact_person_id: z.string().min(1, "Contact person is required"),
    phone: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
    email: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().email("Invalid email address").optional()
    ),
    description: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().optional()
    ),
    address: addressSchema,
});

export type CreateBranchSchema = z.infer<typeof createBranchSchema>;

const logoSchema = z.object({
    logo_url: z.string().min(1, "Logo URL is required"),
});

export type LogoSchema = z.infer<typeof logoSchema>;

// Merchant controller
// Handles: profile management, queue operations, analytics
export const merchantController = {

    /**
     * Get merchant by id
     * @param req - The request object
     * @param res - The response object
     */
    getMerchantById: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;

            const result = await merchantService.getMerchantById(merchant_id);
            res.status(200).json({ success: true, result });
        }
    ),

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
     * Update merchant address
     * @param req - The request object
     * @param res - The response object
     */
    updateMerchantAddress: withActivityLog(
        async (req: Request, res: Response) => {
            const { merchant_id } = req.params;
            const updateData = req.body;
            
            const result = await merchantService.updateMerchantAddress(merchant_id, updateData);
            res.status(200).json({ success: true, result });
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
     * Get user merchants
     * @param req - The request object
     * @param res - The response object
     */
    getUserMerchants: withActivityLog(
        async (req: Request, res: Response) => {    
            const { merchant_id } = req.params;
            const { prefetch } = req.query;

            const result = await merchantService.getUserMerchants(merchant_id);
            res.status(200).json({ success: true, result });
            return result;
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

            // Get the selected branch ID from user data
            const userData = await userService.getUserById(user.user_id);
            const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
            
            if (!selectedBranchId) {
                throw new AppError("No branch selected", 400);
            }

            const { queue_name, tags } = req.body;
            
            const result = await merchantService.createQueue(selectedBranchId, queue_name, tags);
            
            // Emit socket event for queue creation
            if ((req as any).io) {
                (req as any).io.emit("queueCreated", { message: "Queue created successfully" });
            }
            
            res.status(201).json({ success: true, result });
        },
        {
            action: ActivityType.CREATE_QUEUE,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
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
            const user = req.session.user;
            
            if (!user) {
                throw new AppError("User not found", 404);
            }

            // Get the selected branch ID from user data
            const userData = await userService.getUserById(user.user_id);
            const selectedBranchId = userData.user.UserMerchant?.selected_branch_id;
            
            if (!selectedBranchId) {
                throw new AppError("No branch selected", 400);
            }

            const result = await queueService.viewQueuesByBranch(selectedBranchId);
            res.status(200).json({ success: true, result });
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
            
            // Emit socket event for queue update
            if ((req as any).io) {
                (req as any).io.emit("queueUpdated", { queueId: queue_id, message: "Queue updated successfully" });
            }
            
            res.status(200).json({ success: true, result });    
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
            
            // Emit socket event for queue deletion
            if ((req as any).io) {
                (req as any).io.emit("queueDeleted", { queueId: queue_id, message: "Queue deleted successfully" });
            }
            
            res.status(200).json({ success: true, result });
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
        }
    ),

    /**
     * Create a new branch
     * @param req - The request object
     * @param res - The response object
     */
    createBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const validatedData = createBranchSchema.parse(req.body);
            const user = req.session.user;

            if (!user) {
                throw new AppError("User not found", 404);
            }

            // Get merchant_id from the user's session
            const merchant_id = user.merchant_id;
            if (!merchant_id) {
                throw new AppError("Merchant ID not found", 404);
            }

            const result = await merchantService.createBranch({
                ...validatedData,
                merchant_id
            });
            
            res.status(201).json({ success: true, result });
        },
        {
            action: ActivityType.CREATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_name: req.body.branch_name,
                contact_person_id: req.body.contact_person_id,
            }),
        }
    ),

    /**
     * Get branches by merchant id
     * @param req - The request object
     * @param res - The response object
     */
    getBranchesByMerchantId: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;
            
            const { merchant_id } = req.params;
            const { prefetch, user_id } = req.query;

            // Use the user_id from query params if provided, otherwise use session user
            const targetUserId = (user_id as string) || user?.user_id;

            const result = await merchantService.getBranchesByMerchantId(
                merchant_id, 
                prefetch === 'true',
                targetUserId
            );

            res.status(200).json({ success: true, result });
        }
    ),

    /**
     * Switch user's selected branch
     * @param req - The request object
     * @param res - The response object
     */
    switchBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;
            
            if (!user) {
                throw new AppError("User not found", 404);
            }

            const { branch_id } = req.body;
            
            if (!branch_id) {
                throw new AppError("Branch ID is required", 400);
            }

            const result = await merchantService.switchBranch(user.user_id, branch_id);

            // Return the updated user data so frontend can refresh auth
            const updatedUserData = await userService.getUserById(user.user_id);

            res.status(200).json({ 
                success: true, 
                result,
                user: updatedUserData.user
            });
        },
        {
            action: ActivityType.UPDATE_USER,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.body.branch_id,
            }),
        }
    ),

    /**
     * Update branch data
     * @param req - The request object
     * @param res - The response object
     */
    updateBranch: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;
            const updateData = req.body;



            const result = await merchantService.updateBranch(branch_id, updateData);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Update branch address
     * @param req - The request object
     * @param res - The response object
     */
    updateBranchAddress: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;
            const updateData = req.body;

            const result = await merchantService.updateBranchAddress(branch_id, updateData);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Create a new branch feature
     * @param req - The request object
     * @param res - The response object
     */
    createBranchFeature: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;
            const { feature_name } = req.body;

            const result = await merchantService.createBranchFeature(branch_id, feature_name);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                feature_name: req.body.feature_name,
            }),
        }
    ),

    /**
     * Delete a branch feature
     * @param req - The request object
     * @param res - The response object
     */
    deleteBranchFeature: withActivityLog(
        async (req: Request, res: Response) => {
            const { feature_id } = req.params;

            const result = await merchantService.deleteBranchFeature(feature_id);
            res.status(200).json({ success: true, result });
        }
    ),

    /**
     * Create a new branch tag
     * @param req - The request object
     * @param res - The response object
     */
    createBranchTag: withActivityLog(
        async (req: Request, res: Response) => {    
            const { branch_id } = req.params;
            const { tag_name } = req.body;
            
            const result = await merchantService.createBranchTag(branch_id, tag_name);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                tag_name: req.body.tag_name,
            }),
        }
    ),

    /**
     * Delete a branch tag
     * @param req - The request object
     * @param res - The response object
     */
    deleteBranchTag: withActivityLog(
        async (req: Request, res: Response) => {        
            const { tag_id } = req.params;
            
            const result = await merchantService.deleteBranchTag(tag_id);
            res.status(200).json({ success: true, result });
        },
        
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                tag_id: req.body.tag_id,
            }),
        }
    ),  

    /**
     * Update branch images (single or multiple)
     * @param req - The request object
     * @param res - The response object
     */
    uploadBranchImages: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;
            // Use multer's req.file or req.files
            let files: any[] = [];
            if ((req as any).file) {
                files = [(req as any).file];
            } else if ((req as any).files && Array.isArray((req as any).files)) {
                files = (req as any).files;
            }
            if (!files.length) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }
            
            // Determine image type based on route path
            let imageType: 'LOGO' | 'FEATURE_IMAGE' | 'IMAGE';
            if (req.route.path.includes('logo')) {
                imageType = 'LOGO';
            } else if (req.route.path.includes('feature-image')) {
                imageType = 'FEATURE_IMAGE';
            } else if (req.route.path.includes('galleries')) {
                imageType = 'IMAGE';
            } else {
                return res.status(400).json({ success: false, error: 'Invalid image type' });
            }
            
            // Prepare data for DB: each file gets a record
            const imageData = files.map(file => ({
                image_id: undefined, // Let DB generate or use uuid if needed
                image_url: `/uploads/${file.filename}`,
                image_type: imageType,
                uploaded_at: new Date(),
            }));
            // Save to DB
            const result = await merchantService.uploadBranchImages(branch_id, imageData);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                updated_fields: Object.keys(req.body),
            }), 
        }
    ),

    /**
     * Update branch image
     * @param req - The request object
     * @param res - The response object
     */
    updateBranchImage: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id, image_id } = req.params;
            const updateData = req.body;

            const result = await merchantService.updateBranchImage(branch_id, image_id, updateData);
            res.status(200).json({ success: true, result });
            return result; 
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                image_id: req.params.image_id,
            }),
        }
    ),

    /**
     * Delete branch images
     * @param req - The request object
     * @param res - The response object
     */
    deleteBranchImages: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id, image_id } = req.params;
            const result = await merchantService.deleteBranchImages(branch_id, image_id);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                image_id: req.params.image_id,
            }),
        }
    ),

    /**
     * Update branch opening hours
     * @param req - The request object
     * @param res - The response object
     */
    updateBranchOpeningHours: withActivityLog(
        async (req: Request, res: Response) => {
            const { branch_id } = req.params;
            const updateData = req.body;

            const result = await merchantService.updateBranchOpeningHours(branch_id, updateData);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_BRANCH,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                branch_id: req.params.branch_id,
                updated_fields: Object.keys(req.body),
            }),
        }
    ),

    /**
     * Create a new logo
     * @param req - The request object
     * @param res - The response object
     */
    uploadLogo: withActivityLog(
        async (req: Request, res: Response) => {
            const user = req.session.user;

            if (!user) {
                throw new AppError("User not found", 404);
            }

            const merchant_id = user.merchant_id;

            if (!merchant_id) {
                throw new AppError("Merchant not found", 404);
            }

            // Check if file was uploaded
            if (!(req as any).file) {
                throw new AppError("No logo file uploaded", 400);
            }

            const logo_url = `/uploads/${(req as any).file.filename}`;

            const result = await merchantService.uploadLogo(merchant_id, logo_url);

            res.status(200).json({ success: true, result });
        }, {
            action: ActivityType.UPDATE_MERCHANT,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                merchant_id: req.session.user?.merchant_id,
                logo_url: (req as any).file ? `/uploads/${(req as any).file.filename}` : null,
            }),
        }
    ),

    /**
     * Delete a logo
     * @param req - The request object
     * @param res - The response object
     */
    deleteLogo: withActivityLog(
        async (req: Request, res: Response) => {
            const { logo_id } = req.params;

            const result = await merchantService.deleteLogo(logo_id);
            res.status(200).json({ success: true, result });
        },
        {
            action: ActivityType.UPDATE_MERCHANT,
            extractUserId: (req) => req.user?.user_id ?? null,
            extractData: (req, res, result) => ({
                logo_id: req.params.logo_id,
            }),
        }   
    ),
}; 