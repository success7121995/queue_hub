import { Router } from "express";
import { authController } from "../controllers/auth-controller";
import { merchantController } from "../controllers/merchant-controller";
import { requireAuth } from "../middleware/require-auth-middleware";
import { MerchantRole, UserRole } from "@prisma/client";

const router = Router();

// Create a new merchant
router.post("/signup", (req, res) => {authController.register(req, res)});

// Get a merchant
router.get("/:id", () => {});

// Get all merchants
router.get("/", () => {});

// Update a merchant
router.put("/:id", () => {});

// Delete a merchant
router.delete("/:id", () => {});

// Merchant profile management (merchant only)
router.get('/profile', () => {});  // Get merchant profile
router.put('/profile', () => {});  // Update merchant profile
router.put('/settings', () => {});  // Update merchant settings

// Queue management (merchant only)
router.get('/queues/:branch_id', requireAuth([UserRole.MERCHANT], [MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), merchantController.viewQueuesByBranch);  // Get merchant's queues
router.post('/queues/create', requireAuth([UserRole.MERCHANT], [MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), merchantController.createQueue);  // Create new queue
router.put('/queues/:queue_id', requireAuth([UserRole.MERCHANT], [MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.updateQueue);  // Update queue details
router.delete('/queues/:queue_id', requireAuth([UserRole.MERCHANT], [MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.deleteQueue);  // Delete queue
router.put('/queues/:queue_id/status', () => {});  // Update queue status (active/paused/closed)

// Queue operations (merchant only)
router.get('/queues/:queue_id/customers', () => {});  // Get queue customers
router.post('/queues/:queue_id/customers/:customer_id/next', () => {});  // Call next customer
router.post('/queues/:queue_id/customers/:customer_id/skip', () => {});  // Skip customer
router.post('/queues/:queue_id/customers/:customer_id/remove', () => {});  // Remove customer from queue

// Merchant analytics (merchant only)
router.get('/analytics/overview', () => {});  // Get merchant overview statistics
router.get('/analytics/queues', () => {});  // Get queue statistics
router.get('/analytics/customers', () => {});  // Get customer statistics
router.get('/analytics/wait-times', () => {});  // Get wait time statistics

    
export default router;