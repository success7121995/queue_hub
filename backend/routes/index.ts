import { Router } from "express";
import adminRoutes from "./admin-routes";
import merchantRoutes from "./merchant-routes";
import userRoutes from "./user-routes";
import customerRoutes from "./customer-routes";
import messageRoutes from "./message-routes";
import geminiRoutes from "./gemini-routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});

// CORS debug endpoint
router.get("/cors-debug", (req, res) => {
    const origin = req.headers.origin;
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : 'no-origin';
    
    res.status(200).json({
        origin: origin,
        normalizedOrigin: normalizedOrigin,
        allowedOrigins: [
            "http://localhost:3000",
            "https://queue-hub.vercel.app"
        ],
        environment: process.env.NODE_ENV || 'development',
        headers: req.headers
    });
});

// Public routes (no authentication required)
router.use("/auth", userRoutes);  // Login, register, etc.

// Protected routes (authentication required)
router.use("/admin", adminRoutes);    // Admin-only routes
router.use("/merchant", merchantRoutes);  // Merchant-only routes
router.use("/user", userRoutes);  // User-only routes
router.use("/customer", customerRoutes);  // Customer-only routes
router.use("/message", messageRoutes);  // Message-only routes
router.use("/gemini", geminiRoutes);  // Gemini-only routes

export default router;