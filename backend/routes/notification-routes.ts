import { Router } from "express";
import { requireAuth, requireMerchantRole } from '../middleware/require-auth-middleware';

const router = Router();

router.get('/', requireAuth(), (req, res) => {}); // Get all notifications
router.post('/', requireAuth(), (req, res) => {}); // Send notification

export default router;
