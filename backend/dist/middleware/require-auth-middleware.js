"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMerchantRole = exports.requireAdminRole = exports.requireAuth = void 0;
const app_error_1 = require("../utils/app-error");
const prisma_1 = require("../lib/prisma");
require("express-session");
const requireAuth = (requiredUserRole) => {
    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.user) {
                throw new app_error_1.AppError('Not authenticated', 401);
            }
            const { role } = req.session.user;
            if (!requiredUserRole || requiredUserRole.length === 0) {
                return next();
            }
            if (requiredUserRole.includes(role)) {
                return next();
            }
            throw new app_error_1.AppError('Forbidden', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireAuth = requireAuth;
const requireAdminRole = (requiredAdminRole) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user || req.session.user.role !== 'ADMIN') {
                throw new app_error_1.AppError('Admin access required', 403);
            }
            if (!requiredAdminRole || requiredAdminRole.length === 0) {
                return next();
            }
            const userAdmin = await prisma_1.prisma.userAdmin.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });
            if (!userAdmin) {
                throw new app_error_1.AppError('Admin role not found', 403);
            }
            if (requiredAdminRole.includes(userAdmin.role)) {
                return next();
            }
            throw new app_error_1.AppError('Insufficient admin privileges', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireAdminRole = requireAdminRole;
const requireMerchantRole = (requiredMerchantRole) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user || req.session.user.role !== 'MERCHANT') {
                throw new app_error_1.AppError('Merchant access required', 403);
            }
            if (!requiredMerchantRole || requiredMerchantRole.length === 0) {
                return next();
            }
            const userMerchant = await prisma_1.prisma.userMerchant.findFirst({
                where: {
                    user_id: req.session.user.user_id
                },
                select: { role: true }
            });
            if (!userMerchant) {
                throw new app_error_1.AppError('Merchant role not found', 403);
            }
            if (requiredMerchantRole.includes(userMerchant.role)) {
                return next();
            }
            throw new app_error_1.AppError('Insufficient merchant privileges', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireMerchantRole = requireMerchantRole;
