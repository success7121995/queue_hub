"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const merchant_controller_1 = require("../controllers/merchant-controller");
const require_auth_middleware_1 = require("../middleware/require-auth-middleware");
const client_1 = require("@prisma/client");
const multer_1 = require("../lib/multer");
const router = (0, express_1.Router)();
// Create a new merchant
router.post("/signup", (req, res) => { auth_controller_1.authController.registerMerchant(req, res); });
// Get all merchants
router.get("/", () => { });
// Update a merchant
router.put("/:id", () => { });
// Delete a merchant
router.delete("/:id", () => { });
// Merchant profile management (merchant only)
router.get('/profile', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), () => { }); // Get merchant profile
router.put('/profile', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), () => { }); // Update merchant profile
router.put('/settings', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), () => { }); // Update merchant settings
router.patch('/:merchant_id/address', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER]), merchant_controller_1.merchantController.updateMerchantAddress); // Update merchant address
// User merchant management (merchant only)
router.get('/user-merchants/:merchant_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), merchant_controller_1.merchantController.getUserMerchants);
// Branch management (merchant only)
router.get('/branches/:merchant_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), merchant_controller_1.merchantController.getBranchesByMerchantId); // Get merchant's branches
router.post('/branches/create', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER]), merchant_controller_1.merchantController.createBranch); // Create new branch
router.patch('/branches/:branch_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.updateBranch); // Update branch details
router.patch('/branches/:branch_id/address', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.updateBranchAddress); // Update branch address
router.post('/branches/:branch_id/features', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.createBranchFeature); // Create new branch feature
router.delete('/branches/features/:feature_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.deleteBranchFeature); // Delete branch feature
router.post('/branches/:branch_id/tags', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.createBranchTag); // Create new branch tag
router.delete('/branches/tags/:tag_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.deleteBranchTag); // Delete branch tag
router.put('/branches/:branch_id/opening-hours', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.updateBranchOpeningHours); // Update branch opening hours
router.delete('/branches/:branch_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER]), () => { }); // Delete branch
// Branch images management (merchant only)
router.post('/branches/:branch_id/images/feature-image', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), multer_1.uploadFeatureImage, merchant_controller_1.merchantController.uploadBranchImages);
router.post('/branches/:branch_id/images/galleries', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), multer_1.uploadGalleries, merchant_controller_1.merchantController.uploadBranchImages);
router.delete('/branches/:branch_id/images/:image_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.deleteBranchImages);
// Logo management (merchant only)
router.post('/logo', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER]), multer_1.uploadLogo, merchant_controller_1.merchantController.uploadLogo);
router.delete('/logo/:logo_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER]), merchant_controller_1.merchantController.deleteLogo);
// Queue management (merchant only)
router.get('/queues', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), merchant_controller_1.merchantController.viewQueuesByBranch);
router.post('/queues/create', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.createQueue);
// Queue operations (merchant only)
router.get('/queues/:queue_id/customers', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), () => { }); // Get queue customers
router.post('/queues/:queue_id/customers/:customer_id/next', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), () => { }); // Call next customer
router.post('/queues/:queue_id/customers/:customer_id/skip', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), () => { }); // Skip customer
router.post('/queues/:queue_id/customers/:customer_id/remove', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), () => { }); // Remove customer from queue
// Individual queue operations (merchant only)
router.put('/queues/:queue_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.updateQueue);
router.delete('/queues/:queue_id', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), merchant_controller_1.merchantController.deleteQueue);
router.put('/queues/:queue_id/status', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER, client_1.MerchantRole.FRONTLINE]), () => { }); // Update queue status (active/paused/closed)
// Merchant analytics (merchant only)
router.get('/analytics/overview', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), () => { }); // Get merchant overview statistics
router.get('/analytics/queues', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), () => { }); // Get queue statistics
router.get('/analytics/customers', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), () => { }); // Get customer statistics
router.get('/analytics/wait-times', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)([client_1.MerchantRole.OWNER, client_1.MerchantRole.MANAGER]), () => { }); // Get wait time statistics
// Branch switching (merchant only)
router.post('/switch-branch', (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), merchant_controller_1.merchantController.switchBranch);
// Get a merchant (must be last to avoid catching other routes)
router.get("/:merchant_id", (0, require_auth_middleware_1.requireAuth)([client_1.UserRole.MERCHANT]), (0, require_auth_middleware_1.requireMerchantRole)(), merchant_controller_1.merchantController.getMerchantById);
exports.default = router;
