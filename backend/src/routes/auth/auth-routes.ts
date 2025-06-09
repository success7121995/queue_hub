import { Router } from "express";
import {
    merchantSignup,
    login,
    logout,
    handleRedirect,
    verifySession
} from "../../controllers/auth-controllers";
import { requireAuth, requireMerchantAccess, requireAdminAccess } from "../../middlewares/auth-middleware";
import { RequestHandler } from "express";

const router = Router();

// Public routes
router.post("/merchant/signup", merchantSignup as RequestHandler);
router.post("/login", login as RequestHandler);
router.get("/verify-session", verifySession as RequestHandler);
router.get("/redirect/:redirect_token", handleRedirect as RequestHandler);

// Protected routes
router.post("/logout", logout as RequestHandler);

// Protected merchant routes
router.use("/merchant", requireMerchantAccess);

// Protected admin routes
router.use("/admin", requireAdminAccess);

export default router;