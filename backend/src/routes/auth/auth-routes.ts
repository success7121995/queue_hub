import { Router } from "express";
import {
    merchantSignup,
    login,
    logout,
    handleRedirect,
    verifySession
} from "../../controllers/auth-controllers";
import { requireAuth, requireMerchantAccess, requireAdminAccess } from "../../middlewares/auth-middleware";

const router = Router();

// Public routes
router.post("/merchant/signup", merchantSignup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/redirect/:redirect_token", handleRedirect);

// Protected routes
router.get("/verify-session", requireAuth, verifySession);

// Protected merchant routes
router.use("/merchant", requireMerchantAccess);

// Protected admin routes
router.use("/admin", requireAdminAccess);

export default router;