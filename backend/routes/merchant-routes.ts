import { Router } from "express";
import { authController } from "../controllers/auth-controller";
import { merchantController } from "../controllers/merchant-controller";
import { requireAuth, requireMerchantRole } from "../middleware/require-auth-middleware";
import { UserRole, MerchantRole } from "@prisma/client";
import { uploadLogo, uploadFeatureImage, uploadGalleries } from '../lib/multer';

const router = Router();

// Create a new merchant
router.post("/signup", (req, res) => {authController.registerMerchant(req, res)});

// Get all merchants
router.get("/", () => {});

// Update a merchant
router.put("/:id", () => {});

// Delete a merchant
router.delete("/:id", () => {});

// Merchant profile management (merchant only)
router.get('/profile', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), () => {});  // Get merchant profile
router.put('/profile', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), () => {});  // Update merchant profile
router.put('/settings', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), () => {});  // Update merchant settings
router.patch('/:merchant_id/address', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER]), merchantController.updateMerchantAddress);  // Update merchant address

// User merchant management (merchant only)
router.get('/user-merchants/:merchant_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), merchantController.getUserMerchants);

// Branch management (merchant only)
router.get('/branches/:merchant_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), merchantController.getBranchesByMerchantId);  // Get merchant's branches
router.post('/branches/create', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER]), merchantController.createBranch);  // Create new branch
router.patch('/branches/:branch_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.updateBranch);  // Update branch details
router.patch('/branches/:branch_id/address', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.updateBranchAddress);  // Update branch address
router.post('/branches/:branch_id/features', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.createBranchFeature);  // Create new branch feature
router.delete('/branches/features/:feature_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.deleteBranchFeature);  // Delete branch feature
router.post('/branches/:branch_id/tags', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.createBranchTag);  // Create new branch tag
router.delete('/branches/tags/:tag_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.deleteBranchTag);  // Delete branch tag
router.put('/branches/:branch_id/opening-hours', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.updateBranchOpeningHours);  // Update branch opening hours
router.delete('/branches/:branch_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER]), () => {});  // Delete branch

// Branch images management (merchant only)
router.post('/branches/:branch_id/images/feature-image', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), uploadFeatureImage, merchantController.uploadBranchImages);
router.post('/branches/:branch_id/images/galleries', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), uploadGalleries, merchantController.uploadBranchImages);
router.delete('/branches/:branch_id/images/:image_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.deleteBranchImages);

// Logo management (merchant only)
router.post('/logo', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER]), uploadLogo, merchantController.uploadLogo);
router.delete('/logo/:logo_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER]), merchantController.deleteLogo);

// Queue management (merchant only)
router.get('/queues', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), merchantController.viewQueuesByBranch);
router.post('/queues/create', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.createQueue);

// Queue operations (merchant only)
router.get('/queues/:queue_id/customers', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), () => {});  // Get queue customers
router.post('/queues/:queue_id/customers/:customer_id/next', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), () => {});  // Call next customer
router.post('/queues/:queue_id/customers/:customer_id/skip', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), () => {});  // Skip customer
router.post('/queues/:queue_id/customers/:customer_id/remove', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), () => {});  // Remove customer from queue

// Individual queue operations (merchant only)
router.put('/queues/:queue_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.updateQueue);
router.delete('/queues/:queue_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), merchantController.deleteQueue);
router.put('/queues/:queue_id/status', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER, MerchantRole.FRONTLINE]), () => {});  // Update queue status (active/paused/closed)

// Merchant analytics (merchant only)
router.get('/analytics/overview', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), () => {});  // Get merchant overview statistics
router.get('/analytics/queues', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), () => {});  // Get queue statistics
router.get('/analytics/customers', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), () => {});  // Get customer statistics
router.get('/analytics/wait-times', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), () => {});  // Get wait time statistics

// Branch switching (merchant only)
router.post('/switch-branch', requireAuth([UserRole.MERCHANT]), requireMerchantRole(), merchantController.switchBranch);

// Get a merchant (must be last to avoid catching other routes)
router.get("/:merchant_id", requireAuth([UserRole.MERCHANT]), requireMerchantRole(), merchantController.getMerchantById);

export default router;