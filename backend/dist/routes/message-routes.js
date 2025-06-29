"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const require_auth_middleware_1 = require("../middleware/require-auth-middleware");
const message_controller_1 = require("../controllers/message-controller");
const router = (0, express_1.Router)();
// Message routes
router.get('/last', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.getLastMessages); // Get last messages
router.get('/conversation/:otherUserId', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.getConversation); // Get conversation with a user
router.post('/send', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.sendMessage); // Send message
router.put('/:message_id/read', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.markMessageAsRead); // Mark message as read
router.post('/conversation/:otherUserId/delete', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.hideChat); // Hide chat
router.patch('/conversation/:otherUserId/update', (0, require_auth_middleware_1.requireAuth)(), message_controller_1.messageController.updateHiddenChat); // Update hidden chat
exports.default = router;
