import express from "express";
import authRoutes from "./auth/auth-routes";
import adminRoutes from "./admin/admin-routes";
import merchantRoutes from "./merchant/merchant-routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/merchant", merchantRoutes);

export default router;