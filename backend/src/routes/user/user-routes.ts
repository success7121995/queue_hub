import express from "express";
import { requireAuth } from "../../middlewares/auth-middleware";
import { getUserData } from "../../controllers/user-controllers";

const router = express.Router();

router.get("/get-user", requireAuth, getUserData);

export default router;