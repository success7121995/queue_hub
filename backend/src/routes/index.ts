import express from "express";
import authRoutes from "./auth/auth";
import adminRoutes from "./admin/admin-route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;