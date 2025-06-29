"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMerchantRole = exports.requireAdminRole = exports.requireAuth = void 0;
const app_error_1 = require("../utils/app-error");
const prisma_1 = require("../lib/prisma");
require("express-session");
/**
 * Middleware to check if the user is authenticated
 * @param requiredUserRole - Optional array of required user roles. If not provided, any authenticated user can access.
 */
const requireAuth = (requiredUserRole) => {
    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.user) {
                throw new app_error_1.AppError('Not authenticated', 401);
            }
            const { role } = req.session.user;
            // If no roles are required, just check authentication
            if (!requiredUserRole || requiredUserRole.length === 0) {
                return next();
            }
            // Check if user has required role
            if (requiredUserRole.includes(role)) {
                return next();
            }
            // If we get here, the user doesn't have the required role
            throw new app_error_1.AppError('Forbidden', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireAuth = requireAuth;
/**
 * Middleware to check if the user is an admin with required admin role
 * Must be called after requireAuth with UserRole.ADMIN
 * @param requiredAdminRole - Optional array of required admin roles. If not provided, any admin can access.
 */
const requireAdminRole = (requiredAdminRole) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated and is an admin
            if (!req.session.user || req.session.user.role !== 'ADMIN') {
                throw new app_error_1.AppError('Admin access required', 403);
            }
            // If no admin roles are required, any admin can access
            if (!requiredAdminRole || requiredAdminRole.length === 0) {
                return next();
            }
            // Fetch admin role from database
            const userAdmin = await prisma_1.prisma.userAdmin.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });
            if (!userAdmin) {
                throw new app_error_1.AppError('Admin role not found', 403);
            }
            // Check if admin has required role
            if (requiredAdminRole.includes(userAdmin.role)) {
                return next();
            }
            // If we get here, the admin doesn't have the required role
            throw new app_error_1.AppError('Insufficient admin privileges', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireAdminRole = requireAdminRole;
/**
 * Middleware to check if the user is a merchant with required merchant role
 * Must be called after requireAuth with UserRole.MERCHANT
 * @param requiredMerchantRole - Optional array of required merchant roles. If not provided, any merchant can access.
 */
const requireMerchantRole = (requiredMerchantRole) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated and is a merchant
            if (!req.session.user || req.session.user.role !== 'MERCHANT') {
                throw new app_error_1.AppError('Merchant access required', 403);
            }
            // If no merchant roles are required, any merchant can access
            if (!requiredMerchantRole || requiredMerchantRole.length === 0) {
                return next();
            }
            // Fetch merchant role from database
            const userMerchant = await prisma_1.prisma.userMerchant.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });
            if (!userMerchant) {
                throw new app_error_1.AppError('Merchant role not found', 403);
            }
            // Check if merchant has required role
            if (requiredMerchantRole.includes(userMerchant.role)) {
                return next();
            }
            // If we get here, the merchant doesn't have the required role
            throw new app_error_1.AppError('Insufficient merchant privileges', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireMerchantRole = requireMerchantRole;
