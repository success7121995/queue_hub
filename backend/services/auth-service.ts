import { MerchantSchema } from "../controllers/auth-controller";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus, Lang, SubscriptionStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
 
export const authService = {

    /**
     * Register a merchant
     * @param merchant - The merchant object
     */
    async registerMerchant(data: MerchantSchema) {
        const { signup, branchInfo, address, branch_address, payment } = data;

        // Hash password
        const password_hash = await bcrypt.hash(signup.password, 10);

        // Create user and merchant in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create user
            const user = await tx.user.create({
                data: {
                    user_id: uuidv4() + "-" + Date.now(),
                    username: signup.email, // Using email as username
                    fname: signup.fname,
                    lname: signup.lname,
                    email: signup.email,
                    password_hash,
                    phone: signup.phone,
                    role: UserRole.MERCHANT,
                    status: UserStatus.ACTIVE,
                    lang: signup.lang as Lang,
                    email_verified: false,
                    verification_token: uuidv4(), // TODO: Implement email verification
                    updated_at: new Date()
                }
            });

            // 2. Create merchant
            const merchant = await tx.merchant.create({
                data: {
                    merchant_id: uuidv4() + "-" + Date.now(),
                    owner_id: user.user_id,
                    business_name: branchInfo.business_name,
                    phone: signup.phone,
                    email: signup.email,
                    description: branchInfo.description,
                    subscription_status: signup.plan as SubscriptionStatus,
                    auto_renewal: payment.auto_renewal,
                    updated_at: new Date()
                }
            });

            // 3. Create address
            await tx.address.create({
                data: {
                    address_id: uuidv4() + "-" + Date.now(),
                    merchant_id: merchant.merchant_id,
                    street: address.street,
                    unit: address.unit,
                    floor: address.floor,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    country: address.country,
                    updated_at: new Date()
                }
            });

            // 4. Create branch
            const branch = await tx.branch.create({
                data: {
                    branch_id: uuidv4() + "-" + Date.now(),
                    merchant_id: merchant.merchant_id,
                    branch_name: branchInfo.branch_name,
                    phone: branchInfo.branch_phone,
                    email: branchInfo.branch_email,
                    description: branchInfo.description,
                    is_active: true,
                    updated_at: new Date()
                }
            });

            // 5. Create branch address if different from merchant address
            if (branch_address) {
                await tx.address.create({
                    data: {
                        address_id: uuidv4() + "-" + Date.now(),
                        branch_id: branch.branch_id,
                        street: branch_address.street,
                        unit: branch_address.unit,
                        floor: branch_address.floor,
                        city: branch_address.city,
                        state: branch_address.state,
                        zip: branch_address.zip,
                        country: branch_address.country,
                        updated_at: new Date()
                    }
                });
            }

            // 6. Create merchant staff record
            await tx.userMerchant.create({
                data: {
                    staff_id: uuidv4() + "-" + Date.now(),
                    user_id: user.user_id,
                    merchant_id: merchant.merchant_id,
                    position: "Owner",
                    role: "OWNER"
                }
            });

            return { user, merchant, branch };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },

    /**
     * Admin and merchant login
     * @param email - The email of the user
     * @param password - The password of the user
     */
    async login(email: string, password: string) {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { email }
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash ?? "");

            if (!isPasswordValid) {
                throw new AppError("Invalid password", 401);
            }

            if (user.role === UserRole.MERCHANT) {
                const userMerchant = await tx.userMerchant.findFirst({
                    where: { user_id: user.user_id },
                });

                if (!userMerchant) {
                    throw new AppError("User merchant not found", 404);
                }

                const merchant = await tx.merchant.findUnique({
                    where: { merchant_id: userMerchant.merchant_id },
                    include: { Branch: true }
                });
                
                if (!merchant) {
                    throw new AppError("Merchant not found", 404);
                }

                return { user, userMerchant, merchant, redirect: "/merchant" };
            }

            return { user, redirect: "/admin" };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },

    /**
     * Get user by ID
     * @param userId - The user ID
     */
    async getAdminOrMerchantById(userId: string, role: UserRole, merchantId?: string, branchId?: string, availableBranches?: string[]) {

        
        const result = await prisma.$transaction(async (tx) => {
            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                select: {
                    user_id: true,
                    username: true,
                    email: true,
                    fname: true,
                    lname: true,
                    phone: true,
                    role: true,
                    status: true,
                    lang: true,
                    email_verified: true,
                    created_at: true,
                    updated_at: true,
                    last_login: true
                },
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (role === UserRole.MERCHANT) {
                const userMerchant = await tx.userMerchant.findFirst({
                    where: { user_id: user.user_id },
                });
                
                if (!userMerchant) {
                    throw new AppError("User merchant not found", 404);
                }

                const merchant = await tx.merchant.findUnique({
                    where: { merchant_id: userMerchant.merchant_id },
                });

                if (!merchant) {
                    throw new AppError("Merchant not found", 404);
                }

                const branches = await tx.branch.findMany({  
                    where: { branch_id: { in: availableBranches } },
                    include: {
                        BranchFeature: true,
                        BranchImage: true,
                        BranchOpeningHour: true,
                        Queue: true,
                        Address: true,
                        Merchant: true,
                        UserMerchantOnBranch: true,                        
                        Tag: true
                    }
                });

                return { user, userMerchant, merchant, branches };
            }

            return user;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    }

}; 