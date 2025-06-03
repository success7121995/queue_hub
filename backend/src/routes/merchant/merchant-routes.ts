import express from "express";
import { merchantSignup } from "../../controllers/auth-controllers";

const router = express.Router();

// Merchant signup route
router.post("/signup", merchantSignup);

export default router; 