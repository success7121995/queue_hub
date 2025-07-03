import { Router } from "express";
import { requireAuth, requireAdminRole } from "../middleware/require-auth-middleware";
import { UserRole, AdminRole } from "@prisma/client";
import { authController } from "../controllers/auth-controller";
import { adminController } from "../controllers/admin-controller";
import { merchantController } from "../controllers/merchant-controller";

const router = Router();

// Get all admins
router.get("/", requireAuth([UserRole.ADMIN]), (req, res) => adminController.getAdmins(req, res)); // Get all admins
router.post("/", requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), (req, res) => authController.addNewAdmin(req, res)); // Create a new admin

// Merchant management (admin only)
router.get('/merchants', requireAuth([UserRole.ADMIN]), requireAdminRole(), (req, res) => merchantController.getMerchants(req, res));  // Get all merchants (with filters)
router.put('/merchants/:merchant_id', requireAuth([UserRole.ADMIN]), requireAdminRole(), (req, res) => merchantController.updateMerchant(req, res));  // Update merchant
router.put('/merchants/:merchant_id/approval', requireAuth([UserRole.ADMIN]), requireAdminRole(), (req, res) => adminController.approveMerchant(req, res));  // Update merchant approval status
router.delete('/merchants/:merchant_id', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), (req, res) => merchantController.deleteMerchant(req, res));  // Delete merchant

// Get an admin
router.get('/:id', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});

// Get all admins
router.get("/", requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});

// Update an admin
router.put("/:id", requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN]), () => {});

// Delete an admin
router.delete("/:id", requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN]), () => {});

// User management (admin only)
router.get('/users', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get all users
router.get('/users/:userId', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get user details
router.put('/users/:userId/status', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), () => {});  // Update user status
router.delete('/users/:userId', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN]), () => {});  // Delete user account

// Queue management (admin only)
router.get('/queues', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get all queues
router.get('/queues/:queueId', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get queue details
router.delete('/queues/:queueId', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), () => {});  // Delete queue
router.put('/queues/:queueId/status', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), () => {});  // Update queue status

// Analytics (admin only)
router.get('/analytics/overview', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get system overview statistics
router.get('/analytics/merchants', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get merchant statistics
router.get('/analytics/users', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get user statistics
router.get('/analytics/queues', requireAuth([UserRole.ADMIN]), requireAdminRole(), () => {});  // Get queue statistics

export default router;