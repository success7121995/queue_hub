import {
    createAdmin,
    deleteAdmin,
    updateAdmin,
    viewAllAdminUsers,
    viewAdminUser,
    viewAllMerchants,
    viewMerchant,
} from "../../controllers/admin-controller";
import { Router } from "express";

const router = Router();

// Admin routes
router.get("/admin/all", viewAllAdminUsers);
router.get("/admin/:user_id", viewAdminUser);
router.post("/admin/create", createAdmin);
router.post("/admin/update", updateAdmin);
router.post("/admin/delete", deleteAdmin);
router.get("/merchant/all", viewAllMerchants);
router.get("/merchant/:merchant_id", viewMerchant);

export default router;