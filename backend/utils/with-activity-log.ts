import { Request, Response } from "express";
import { ActivityType } from "@prisma/client";
import { adminService } from "../services/admin-service";
import { AppError } from "./app-error";

export const withActivityLog = (
    handler: (req: Request, res: Response) => Promise<any>,
    config?: {
        action?: ActivityType;
        extractUserId?: (req: Request, res: Response, result: any) => string | null;
        extractData?: (req: Request, res: Response, result: any) => any;
    }
) => {
    return async (req: Request, res: Response) => {
        let error: string | null = null;
        let status = 500;
        let result: any = null;

        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            status = res.statusCode;
            return originalJson(body);
        };

        try {
            result = await handler(req, res);
            status = res.statusCode;
            error = null;
        } catch (err) {
            if (err instanceof AppError) {
                status = err.status;
                error = err.message;
                res.status(status).json({ success: false, error });
            } else {
                status = 500;
                error = "Unexpected error";
                res.status(500).json({ success: false, error });
                console.error(err);
            }
        } finally {
            try {
                await adminService.createActivityLog({
                    action: config?.action!,
                    action_data: config?.extractData?.(req, res, result) ?? {},
                    success: !error,
                    error,
                    status,
                    user_id: config?.extractUserId?.(req, res, result) ?? null,
                });
            } catch (logErr) {
                console.error("Activity log failed:", logErr);
            }
        }
    };
};
