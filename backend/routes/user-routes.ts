import { Router } from 'express';
import { authController } from '../controllers/auth-controller';

const router = Router();

// Auth routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => authController.me(req, res));

// User profile routes
router.get('/profile', () => {});  // Get current user profile
router.put('/profile', () => {});  // Update user profile
router.put('/change-password', () => {});  // Change user password

// User queue management (protected)
router.get('/queues', () => {});  // Get user's active queues
router.post('/queues/:queueId/join', () => {});  // Join a queue
router.delete('/queues/:queueId/leave', () => {});  // Leave a queue
router.get('/queues/:queueId/status', () => {});  // Get queue status

export default router;
