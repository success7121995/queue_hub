"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const user_controller_1 = require("../controllers/user-controller");
const require_auth_middleware_1 = require("../middleware/require-auth-middleware");
const client_1 = require("@prisma/client");
const multer_1 = require("../lib/multer");
const router = (0, express_1.Router)();
// Auth routes
router.post('/login', (req, res) => auth_controller_1.authController.login(req, res));
router.post('/logout', (req, res) => auth_controller_1.authController.logout(req, res));
router.get('/me', (req, res) => user_controller_1.userController.me(req, res));
router.put('/me', (0, require_auth_middleware_1.requireAuth)(), (req, res) => user_controller_1.userController.updateProfile(req, res));
// Avatar routes
router.post('/avatar', (0, require_auth_middleware_1.requireAuth)(), multer_1.uploadAvatar, (req, res) => user_controller_1.userController.uploadAvatar(req, res));
router.delete('/avatar', (0, require_auth_middleware_1.requireAuth)(), (req, res) => user_controller_1.userController.deleteAvatar(req, res));
// Employee routes
router.post('/employee/create', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), (req, res) => auth_controller_1.authController.addNewEmployee(req, res));
router.get('/employee/get', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), (req, res) => user_controller_1.userController.getEmployees(req, res));
router.post('/employee/:staff_id/assign-branches', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), (req, res) => user_controller_1.userController.assignBranches(req, res));
router.put('/employee/:staff_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), (req, res) => user_controller_1.userController.updateEmployee(req, res));
router.delete('/employee/:user_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), (req, res) => user_controller_1.userController.deleteEmployee(req, res));
// User profile routes
router.put('/change-password', (0, require_auth_middleware_1.requireAuth)(), (req, res) => auth_controller_1.authController.changePassword(req, res)); // Change user password
// User queue management (protected)
router.get('/queues', (0, require_auth_middleware_1.requireAuth)(), () => { }); // Get user's active queues
router.post('/queues/:queue_id/join', (0, require_auth_middleware_1.requireAuth)(), () => { }); // Join a queue
router.delete('/queues/:queue_id/leave', (0, require_auth_middleware_1.requireAuth)(), () => { }); // Leave a queue
router.get('/queues/:queue_id/status', (0, require_auth_middleware_1.requireAuth)(), () => { }); // Get queue status
exports.default = router;
