import { Router } from "express";
import { requireAuth } from "../middleware/require-auth-middleware";
import { messageController } from "../controllers/message-controller";
import { uploadChatAttachment } from "../lib/multer";

const router = Router();

// Message routes
router.get('/last', requireAuth(), messageController.getLastMessages); // Get last messages
router.get('/conversation/:other_user_id', requireAuth(), messageController.getConversation); // Get conversation with a user
router.post('/send', requireAuth(), messageController.sendMessage); // Send message
router.post('/send-with-attachment', requireAuth(), uploadChatAttachment, messageController.sendMessageWithAttachment); // Send message with attachment
router.put('/:message_id/read', requireAuth(), messageController.markMessageAsRead); // Mark message as read
router.post('/conversation/:other_user_id/delete', requireAuth(), messageController.hideChat); // Hide chat
router.patch('/conversation/:other_user_id/update', requireAuth(), messageController.updateHiddenChat); // Update hidden chat

export default router;