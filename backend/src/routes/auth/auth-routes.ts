import { Router } from "express";
import {
    merchantSignup,
    login,
    logout
} from "../../controllers/auth-controllers";

const router = Router();

// Merchant routes
router.post("/merchant/signup", merchantSignup);

// Auth routes
router.post("/login", login);
router.post("/logout", logout);

export default router;