import { Router } from 'express';
import { authController } from '../controllers/auth-controller';
import { userController } from '../controllers/user-controller';
import { requireAuth, requireMerchantRole } from '../middleware/require-auth-middleware';
import { MerchantRole, UserRole } from '@prisma/client';
import { uploadAvatar } from "../lib/multer";

const router = Router();

// Auth routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => userController.me(req, res));
router.put('/me', requireAuth(), (req, res) => userController.updateProfile(req, res));

// Avatar routes
router.post('/avatar', requireAuth(), uploadAvatar, (req, res) => userController.uploadAvatar(req, res));
router.delete('/avatar', requireAuth(), (req, res) => userController.deleteAvatar(req, res));

// Employee routes
router.post('/employee/create', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => authController.addNewEmployee(req, res));
router.get('/employee/get', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.getEmployees(req, res));
router.post('/employee/:staff_id/assign-branches', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.assignBranches(req, res));
router.put('/employee/:staff_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.updateEmployee(req, res));
router.delete('/employee/:user_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.deleteEmployee(req, res));

// User profile routes
router.put('/change-password', requireAuth(), (req, res) => authController.changePassword(req, res));  // Change user password

// User queue management (protected)
router.get('/queues', requireAuth(), () => {});  // Get user's active queues
router.post('/queues/:queueId/join', requireAuth(), () => {});  // Join a queue
router.delete('/queues/:queueId/leave', requireAuth(), () => {});  // Leave a queue
router.get('/queues/:queueId/status', requireAuth(), () => {});  // Get queue status

export default router;
