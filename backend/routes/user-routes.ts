import { Router } from 'express';
import { authController } from '../controllers/auth-controller';
import { userController } from '../controllers/user-controller';
import { requireAuth } from '../middleware/require-auth-middleware';

const router = Router();

// Auth routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => authController.me(req, res));
router.put('/me', (req, res) => userController.updateProfile(req, res));

// User profile routes

router.put('/change-password', () => {});  // Change user password

// User queue management (protected)
router.get('/queues', () => {});  // Get user's active queues
router.post('/queues/:queueId/join', () => {});  // Join a queue
router.delete('/queues/:queueId/leave', () => {});  // Leave a queue
router.get('/queues/:queueId/status', () => {});  // Get queue status

export default router;
