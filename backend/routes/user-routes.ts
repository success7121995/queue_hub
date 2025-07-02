import { Router } from 'express';
import { authController } from '../controllers/auth-controller';
import { userController } from '../controllers/user-controller';
import { requireAdminRole, requireAuth, requireMerchantRole } from '../middleware/require-auth-middleware';
import { AdminRole, MerchantRole, UserRole } from '@prisma/client';
import { uploadAvatar } from "../lib/multer";

const router = Router();

// Auth routes
router.post('/admin/create', requireAuth([UserRole.ADMIN]), requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.OPS_ADMIN]), (req, res) => authController.addNewAdmin(req, res)); // Add new admin
router.get('/unique-username-and-email', (req, res) => authController.checkUniqueUsernameAndEmail(req, res)); // Check unique username and email
router.post('/login', (req, res) => authController.login(req, res)); // Login
router.post('/logout', (req, res) => authController.logout(req, res)); // Logout
router.get('/me', (req, res) => userController.me(req, res)); // Get user profile
router.put('/me', requireAuth(), (req, res) => userController.updateProfile(req, res)); // Update user profile

// Avatar routes
router.post('/avatar', requireAuth(), uploadAvatar, (req, res) => userController.uploadAvatar(req, res)); // Upload avatar
router.delete('/avatar', requireAuth(), (req, res) => userController.deleteAvatar(req, res)); // Delete avatar

// Employee routes
router.post('/employee/create', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => authController.addNewEmployee(req, res)); // Add new employee
router.get('/employee/get', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.getEmployees(req, res)); // Get employees
router.post('/employee/:staff_id/assign-branches', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.assignBranches(req, res)); // Assign branches to employee
router.put('/employee/:staff_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.updateEmployee(req, res)); // Update employee
router.delete('/employee/:user_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.deleteEmployee(req, res)); // Delete employee

// User profile routes
router.put('/change-password', requireAuth(), (req, res) => authController.changePassword(req, res));  // Change user password 

// User queue management (protected)
router.get('/queues', requireAuth(), () => {});  // Get user's active queues
router.post('/queues/:queue_id/join', requireAuth(), () => {});  // Join a queue
router.delete('/queues/:queue_id/leave', requireAuth(), () => {});  // Leave a queue
router.get('/queues/:queue_id/status', requireAuth(), () => {});  // Get queue status


export default router;
