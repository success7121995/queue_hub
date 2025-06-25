import { EmployeeSchema, MerchantSchema } from "../controllers/auth-controller";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus, Lang, SubscriptionStatus, Prisma, DayOfWeek, MerchantRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/app-error";
 
export const authService = {

    /**
     * Register a merchant
     * @param merchant - The merchant object
     */
    async registerMerchant(data: MerchantSchema) {
        const { signup, branchInfo, address, branchAddress, payment } = data;

        // Hash password
        const password_hash = await bcrypt.hash(signup.password, 10);

        // Create user and merchant in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create user
            const user = await tx.user.create({
                data: {
                    user_id: uuidv4(),
                    username: signup.username,
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
                    merchant_id: uuidv4(),
                    owner_id: user.user_id,
                    business_name: signup.business_name,
                    phone: signup.phone,
                    email: signup.email,
                    description: branchInfo.description,
                    subscription_status: signup.plan as SubscriptionStatus,
                    auto_renewal: payment.auto_renewal,
                    updated_at: new Date()
                }
            });

            // 3. Create staff record for owner (UserMerchant)
            const staff = await tx.userMerchant.create({
                data: {
                    staff_id: uuidv4(),
                    user_id: user.user_id,
                    merchant_id: merchant.merchant_id,
                    position: "Owner",
                    role: "OWNER"
                }
            });

            // 4. Create address
            await tx.address.create({
                data: {
                    address_id: uuidv4(),
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

            // 5. Create branch
            const branch = await tx.branch.create({
                data: {
                    branch_id: uuidv4(),
                    contact_person_id: staff.staff_id, // Use staff_id as contact_person_id
                    merchant_id: merchant.merchant_id,
                    branch_name: branchInfo.branch_name,
                    phone: branchInfo.phone,
                    email: branchInfo.email,
                    description: branchInfo.description,
                    is_active: true,
                    updated_at: new Date(),
                }
            });

            // 6. Create branch opening hours
            const daysOfWeek = [
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY,
                DayOfWeek.SATURDAY,
                DayOfWeek.SUNDAY,
            ];

            const openingHoursData = daysOfWeek.map((day) => ({
                id: uuidv4(),
                branch_id: branch.branch_id,
                day_of_week: day,
                open_time: new Date('1970-01-01T09:00:00.000Z'),
                close_time: new Date('1970-01-01T18:00:00.000Z'),
                is_closed: true,
                created_at: new Date(),
                updated_at: new Date(),
            }));

            for (const data of openingHoursData) {
                await tx.branchOpeningHour.create({ data });
            }

            // 7. Create branch address if different from merchant address
            if (branchAddress) {
                await tx.address.create({
                    data: {
                        address_id: uuidv4(),
                        branch_id: branch.branch_id,
                        street: branchAddress.street,
                        unit: branchAddress.unit,
                        floor: branchAddress.floor,
                        city: branchAddress.city,
                        state: branchAddress.state,
                        zip: branchAddress.zip,
                        country: branchAddress.country,
                        updated_at: new Date()
                    }
                });
            }

            // 8. Assign merchant to branch
            await tx.userMerchantOnBranch.create({
                data: {
                    staff_id: staff.staff_id,
                    branch_id: branch.branch_id,
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
                where: { email },
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
                    include: {
                        Merchant: { select: { merchant_id: true } },
                        UserMerchantOnBranch: { select: { branch_id: true } }
                    }
                });

                if (!userMerchant) {
                    throw new AppError("User merchant not found", 404);
                }

                if (userMerchant?.UserMerchantOnBranch.length === 0) {
                    throw new AppError("User is not assigned to any branch", 403);
                }

                const merchant = await tx.merchant.findUnique({
                    where: { merchant_id: userMerchant.merchant_id },
                    include: { Branch: { select: { branch_id: true } } }
                });
                
                if (!merchant) {
                    throw new AppError("Merchant not found", 404);
                }

                return { user, merchant, userMerchant, redirect: "/merchant" };
            }

            if (user.role === UserRole.ADMIN) {
                const userAdmin = await tx.userAdmin.findUnique({
                    where: { user_id: user.user_id },
                });

                if (!userAdmin) {
                    throw new AppError("User admin not found", 404);
                }

                return { user, userAdmin, redirect: "/admin" };
            }

        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    },


    /**
     * Add new employee
     * @param data 
     */
    async addNewEmployee(merchant_id: string, data: EmployeeSchema) {
        const result = await prisma.$transaction(async (tx) => {
            // Hash password
            const password_hash = await bcrypt.hash(data.password, 10);

            const user = await tx.user.create({
                data: {
                    user_id: uuidv4(),
                    username: data.username,
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    phone: data.phone,
                    role: UserRole.MERCHANT,
                    password_hash,
                    status: UserStatus.ACTIVE,
                    lang: Lang.EN,
                    email_verified: false,
                    verification_token: uuidv4(),
                    updated_at: new Date()
                }
            });

            const userMerchant = await tx.userMerchant.create({
                data: {
                    staff_id: data.staff_id ?? uuidv4(),
                    user_id: user.user_id,
                    merchant_id,
                    position: data.position,
                    role: data.role as MerchantRole
                }
            });

            const avatar = await tx.avatar.create({
                data: {
                    image_id: uuidv4(),
                    user_id: user.user_id,
                    image_url: data.image_url ?? ""
                }
            });

            return { user, userMerchant, avatar };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return result;
    }
}; 