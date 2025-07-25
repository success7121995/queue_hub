import { Router } from 'express';
import { authController } from '../controllers/auth-controller';
import { userController } from '../controllers/user-controller';
import { requireAdminRole, requireAuth, requireMerchantRole } from '../middleware/require-auth-middleware';
import { AdminRole, MerchantRole, UserRole } from '@prisma/client';
import { uploadAvatar, uploadTicketFiles } from "../lib/multer";
import { adminController } from '../controllers/admin-controller';

const router = Router();

// Auth routes

router.get('/unique-username-and-email', (req, res) => authController.checkUniqueUsernameAndEmail(req, res)); // Check unique username and email
router.post('/login', (req, res) => authController.login(req, res)); // Login
router.post('/logout', (req, res) => authController.logout(req, res)); // Logout
router.get('/me', (req, res) => userController.me(req, res)); // Get user profile
router.put('/me', requireAuth(), (req, res) => userController.updateProfile(req, res)); // Update user profile

// Avatar routes
router.post('/avatar', requireAuth(), uploadAvatar, (req, res) => userController.uploadAvatar(req, res)); // Upload avatar
router.delete('/avatar', requireAuth(), (req, res) => userController.deleteAvatar(req, res)); // Delete avatar

// Admin routes
router.get('/admin', requireAuth([UserRole.ADMIN]), (req, res) => adminController.getAdmins(req, res)); // Get admin

// Employee routes
router.post('/employee/create', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => authController.addNewEmployee(req, res)); // Add new employee
router.get('/employee/get', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.getEmployees(req, res)); // Get employees
router.post('/employee/:staff_id/assign-branches', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.assignBranches(req, res)); // Assign branches to employee
router.put('/employee/:staff_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.updateEmployee(req, res)); // Update employee
router.delete('/employee/:user_id', requireAuth([UserRole.MERCHANT]), requireMerchantRole([MerchantRole.OWNER, MerchantRole.MANAGER]), (req, res) => userController.deleteEmployee(req, res)); // Delete employee

// User profile routes
router.put('/change-password', requireAuth(), (req, res) => authController.changePassword(req, res));  // Change user password 

// User ticket routes
router.post('/ticket', requireAuth(), uploadTicketFiles, (req, res) => userController.createTicket(req, res)); // Create a ticket
router.get('/ticket/all', requireAuth([UserRole.ADMIN]), (req, res) => userController.getAllTickets(req, res)); // Get all tickets (admin only)
router.get('/ticket', requireAuth(), (req, res) => userController.getTickets(req, res)); // Get user's own tickets
router.get('/ticket/:ticket_id', requireAuth(), (req, res) => userController.getTicket(req, res)); // Get a ticket
router.put('/ticket/:ticket_id', requireAuth([UserRole.ADMIN]), (req, res) => userController.updateTicket(req, res)); // Update a ticket (admin only)

// User queue management (protected)
router.get('/queues', requireAuth(), () => {});  // Get user's active queues
router.post('/queues/:queue_id/join', requireAuth(), () => {});  // Join a queue
router.delete('/queues/:queue_id/leave', requireAuth(), () => {});  // Leave a queue
router.get('/queues/:queue_id/status', requireAuth(), () => {});  // Get queue status


export default router;
