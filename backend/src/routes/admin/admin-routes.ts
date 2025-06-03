import {
    createAdmin,
    deleteAdmin,
    updateAdmin,
    viewAllAdminUsers,
    viewAdminUser,
    viewAllMerchants,
    viewMerchant,
    updateMerchant,
    approveMerchant,
    rejectMerchant,
} from "../../controllers/admin-controllers";
import { Router } from "express";

const router = Router();

// Admin routes
router.get("/admin/all", viewAllAdminUsers);
router.get("/admin/:user_id", viewAdminUser);
router.post("/admin/create", createAdmin);
router.post("/admin/update", updateAdmin);
router.delete("/admin/delete", deleteAdmin);
router.get("/admin/merchant/all", viewAllMerchants);
router.get("/admin/merchant/:merchant_id", viewMerchant);
router.put("/admin/merchant/:merchant_id", updateMerchant);
router.put("/admin/merchant/:merchant_id/approve", approveMerchant);
router.put("/admin/merchant/:merchant_id/reject", rejectMerchant);

export default router;