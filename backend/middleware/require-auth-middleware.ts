import { Request, Response, NextFunction } from 'express';
import { type UserRole, type MerchantRole, type AdminRole } from '@prisma/client';
import { AppError } from '../utils/app-error';
import { prisma } from '../lib/prisma';
import 'express-session';

/**
 * Middleware to check if the user is authenticated
 * @param requiredUserRole - Optional array of required user roles. If not provided, any authenticated user can access.
 */
export const requireAuth = (requiredUserRole?: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            if (!req.session || !req.session.user) {
                throw new AppError('Not authenticated', 401);
            }

            const { role } = req.session.user;

            // If no roles are required, just check authentication
            if (!requiredUserRole || requiredUserRole.length === 0) {
                return next();
            }

            // Check if user has required role
            if (requiredUserRole.includes(role as UserRole)) {
                return next();
            }

            // If we get here, the user doesn't have the required role
            throw new AppError('Forbidden', 403);
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check if the user is an admin with required admin role
 * Must be called after requireAuth with UserRole.ADMIN
 * @param requiredAdminRole - Optional array of required admin roles. If not provided, any admin can access.
 */
export const requireAdminRole = (requiredAdminRole?: AdminRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated and is an admin
            if (!req.session.user || req.session.user.role !== 'ADMIN') {
                throw new AppError('Admin access required', 403);
            }

            // If no admin roles are required, any admin can access
            if (!requiredAdminRole || requiredAdminRole.length === 0) {
                return next();
            }

            // Fetch admin role from database
            const userAdmin = await prisma.userAdmin.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });

            if (!userAdmin) {
                throw new AppError('Admin role not found', 403);
            }

            // Check if admin has required role
            if (requiredAdminRole.includes(userAdmin.role)) {
                return next();
            }

            // If we get here, the admin doesn't have the required role
            throw new AppError('Insufficient admin privileges', 403);
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check if the user is a merchant with required merchant role
 * Must be called after requireAuth with UserRole.MERCHANT
 * @param requiredMerchantRole - Optional array of required merchant roles. If not provided, any merchant can access.
 */
export const requireMerchantRole = (requiredMerchantRole?: MerchantRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated and is a merchant
            if (!req.session.user || req.session.user.role !== 'MERCHANT') {
                throw new AppError('Merchant access required', 403);
            }

            // If no merchant roles are required, any merchant can access
            if (!requiredMerchantRole || requiredMerchantRole.length === 0) {
                return next();
            }

            // Fetch merchant role from database
            const userMerchant = await prisma.userMerchant.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });

            if (!userMerchant) {
                throw new AppError('Merchant role not found', 403);
            }

            // Check if merchant has required role
            if (requiredMerchantRole.includes(userMerchant.role)) {
                return next();
            }

            // If we get here, the merchant doesn't have the required role
            throw new AppError('Insufficient merchant privileges', 403);
        } catch (error) {
            next(error);
        }
    };
};