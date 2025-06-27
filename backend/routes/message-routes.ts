import { Router } from "express";
import { requireAuth } from "../middleware/require-auth-middleware";

const router = Router();

// Message routes
router.get('/preview', requireAuth(), (req, res) => {}); // Get message preview
router.post('/', requireAuth(), (req, res) => {}); // Send message
router.put('/:message_id/read', requireAuth(), (req, res) => {}); // Mark message as read
router.delete('/', requireAuth(), (req, res) => {}); // Delete message

export default router;