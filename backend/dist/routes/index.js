"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_1 = __importDefault(require("./admin-routes"));
const merchant_routes_1 = __importDefault(require("./merchant-routes"));
const user_routes_1 = __importDefault(require("./user-routes"));
const customer_routes_1 = __importDefault(require("./customer-routes"));
const message_routes_1 = __importDefault(require("./message-routes"));
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.use("/auth", user_routes_1.default); // Login, register, etc.
// Protected routes (authentication required)
router.use("/admin", admin_routes_1.default); // Admin-only routes
router.use("/merchant", merchant_routes_1.default); // Merchant-only routes
router.use("/user", user_routes_1.default); // User-only routes
router.use("/customer", customer_routes_1.default); // Customer-only routes
router.use("/message", message_routes_1.default); // Message-only routes
exports.default = router;
