import express from "express";
import { requireAuth, requireMerchantAccess } from "../../middlewares/auth-middleware";
import { viewMerchant } from "../../controllers/merchant-controllers";
import { Router } from "express";
import {
    addBranch,
    addEmployee
} from "../../controllers/merchant-controllers";
import { RequestHandler } from "express";

const router = express.Router();

// Merchant routes
router.get("/get-merchant", requireAuth, requireMerchantAccess, viewMerchant);

// Protected merchant routes
router.use(requireMerchantAccess);

// Branch management
router.post("/branch", addBranch as RequestHandler);

// Staff management
router.post("/employee", addEmployee as RequestHandler);

export default router; 