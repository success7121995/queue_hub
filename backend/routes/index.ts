import { Router } from "express";
import adminRoutes from "./admin-routes";
import merchantRoutes from "./merchant-routes";
import userRoutes from "./user-routes";
import customerRoutes from "./customer-routes";
import messageRoutes from "./message-routes";
import notificationRoutes from "./notification-routes";

const router = Router();

// Public routes (no authentication required)
router.use("/auth", userRoutes);  // Login, register, etc.

// Protected routes (authentication required)
router.use("/admin", adminRoutes);    // Admin-only routes
router.use("/merchant", merchantRoutes);  // Merchant-only routes
router.use("/user", userRoutes);  // User-only routes
router.use("/customer", customerRoutes);  // Customer-only routes
router.use("/message", messageRoutes);  // Message-only routes
router.use("/notification", notificationRoutes);  // Notification-only routes

export default router;