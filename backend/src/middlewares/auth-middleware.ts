import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { UserRole } from "@prisma/client";

export interface UserAccess {
    role: string;
    merchant_id?: string | null;
}

/**
 * Require authentication
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        throw new AppError("Unauthorized - Please login", 401);
    }
    next();
};

/**
 * Validate user access
 * @param user - The user object
 * @param allowedRoles - The allowed roles
 */
export const validateUserAccess = async (user: UserAccess, allowedRoles: UserRole[]) => {
    if (!allowedRoles.includes(user.role as UserRole)) {
        throw new AppError("Forbidden - Insufficient permissions", 403);
    }
};

/**
 * Require merchant access
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const requireMerchantAccess = (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user) {
        throw new AppError("Unauthorized - Please login", 401);
    }
    if (user.role !== UserRole.MERCHANT) {
        throw new AppError("Forbidden - Merchant access required", 403);
    }
    next();
};

/**
 * Require admin access
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const requireAdminAccess = (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user) {
        throw new AppError("Unauthorized - Please login", 401);
    }
    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN, UserRole.SUPPORT_AGENT] as const;
    if (!adminRoles.includes(user.role as typeof adminRoles[number])) {
        throw new AppError("Forbidden - Admin access required", 403);
    }
    next();
}; 