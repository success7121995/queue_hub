import { Request, Response, NextFunction } from 'express';
import { type UserRole, type MerchantRole } from '@prisma/client';
import { AppError } from '../utils/app-error';
import { prisma } from '../lib/prisma';

/**
 * Middleware to check if the user is authenticated and has the required roles
 * @param requiredUserRole - Optional required user role (ADMIN, MERCHANT)
 * @param requiredMerchantRole - Optional required merchant role (OWNER, MANAGER, FRONTLINE)
 */
export const requireAuth = (requiredUserRole?: UserRole[], requiredMerchantRole?: MerchantRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated
            if (!req.session.user) {
                throw new AppError('Not authenticated', 401);
            }

            const { role, userId, merchantId } = req.session.user;

            // If no roles are required, just check authentication
            if (!requiredUserRole && !requiredMerchantRole) {
                return next();
            }

            // Check merchant role first if required
            if (requiredMerchantRole) {
                let userMerchantRole: MerchantRole | undefined = req.session.user.merchantRole as MerchantRole;

                // If merchant role is not in session, fetch it from database
                if (!userMerchantRole && merchantId) {
                    const userMerchant = await prisma.userMerchant.findFirst({
                        where: {
                            user_id: userId,
                            merchant_id: merchantId
                        },
                        select: { role: true }
                    });
                    userMerchantRole = userMerchant?.role;
                }

                if (requiredMerchantRole.includes(userMerchantRole as MerchantRole)) {
                    return next();
                }
            }

            // Check user role if required
            if (requiredUserRole) {
                if (requiredUserRole.includes(role as UserRole)) {
                    return next();
                }
            }

            // If we get here, the user doesn't have the required role
            throw new AppError('Forbidden', 403);
        } catch (error) {
            next(error);
        }
    };
};