"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const require_auth_middleware_1 = require("../middleware/require-auth-middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Create a new admin
router.post("/create", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN]), () => { });
// Get an admin
router.get("/:id", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { });
// Get all admins
router.get("/", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { });
// Update an admin
router.put("/:id", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN]), () => { });
// Delete an admin
router.delete("/:id", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN]), () => { });
// Merchant management (admin only)
router.get('/merchants', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get all merchants
router.post('/merchants', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Create new merchant account
router.get('/merchants/:merchantId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get merchant details
router.put('/merchants/:merchantId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Update merchant details
router.delete('/merchants/:merchantId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN]), () => { }); // Delete merchant account
router.put('/merchants/:merchantId/status', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Update merchant status (active/suspended)
// User management (admin only)
router.get('/users', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get all users
router.get('/users/:userId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get user details
router.put('/users/:userId/status', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Update user status
router.delete('/users/:userId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN]), () => { }); // Delete user account
// Queue management (admin only)
router.get('/queues', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get all queues
router.get('/queues/:queueId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get queue details
router.delete('/queues/:queueId', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Delete queue
router.put('/queues/:queueId/status', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)([client_1.AdminRole.SUPER_ADMIN, client_1.AdminRole.OPS_ADMIN]), () => { }); // Update queue status
// Analytics (admin only)
router.get('/analytics/overview', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get system overview statistics
router.get('/analytics/merchants', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get merchant statistics
router.get('/analytics/users', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get user statistics
router.get('/analytics/queues', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.ADMIN]), (0, require_auth_middleware_1.requireAdminRole)(), () => { }); // Get queue statistics
exports.default = router;
