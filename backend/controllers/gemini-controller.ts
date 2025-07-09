import { Request, Response, NextFunction } from "express";
import { geminiService } from "../services/gemini-service";
import { withActivityLog } from "../utils/with-activity-log";
import { ActivityType } from "@prisma/client";
import { z } from "zod";

// This controller is currently unused for ticket creation
// The user controller calls geminiService.determineTicketPriority() directly
export const geminiController = {
    // No functions currently needed for ticket creation flow
};   