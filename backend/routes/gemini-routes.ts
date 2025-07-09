import { Router } from "express";
import { geminiController } from "../controllers/gemini-controller";
import { requireAuth } from "../middleware/require-auth-middleware";

const router = Router();

// This route is currently unused for ticket creation
// The user controller calls geminiService.determineTicketPriority() directly
// No routes currently needed for ticket creation flow

export default router;