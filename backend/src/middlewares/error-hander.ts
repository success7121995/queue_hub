import { Request, Response, NextFunction } from "express";
import { AppError } from "../helpers/app-error";

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {

    // Log the error
    console.error(err);

    if (err instanceof AppError) {
        const statusCode = err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        const code = (err as AppError).code || "INTERNAL_SERVER_ERROR";
        const details = (err as AppError).details || null;

        res.status(statusCode).json({ message, code, details });
    } else {
        res.status(500).json({ message: "Internal Server Error", code: "INTERNAL_SERVER_ERROR", details: null });
    }
}
