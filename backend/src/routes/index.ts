import express from "express";
import authRoutes from "./auth/auth-routes";
import adminRoutes from "./admin/admin-routes";
import merchantRoutes from "./merchant/merchant-routes";
import userRoutes from "./user/user-routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/merchant", merchantRoutes);
router.use("/user", userRoutes);

export default router;