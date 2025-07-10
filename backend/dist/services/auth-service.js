"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const app_error_1 = require("../utils/app-error");
exports.authService = {
    async addNewAdmin(data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const password_hash = await bcryptjs_1.default.hash(data.password, 10);
            const user = await tx.user.create({
                data: {
                    user_id: (0, uuid_1.v4)(),
                    username: data.username,
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    password_hash,
                    phone: data.phone,
                    role: client_1.UserRole.ADMIN,
                    status: client_1.UserStatus.ACTIVE,
                    lang: client_1.Lang.EN,
                    email_verified: false,
                    verification_token: (0, uuid_1.v4)(),
                    updated_at: new Date()
                }
            });
            const userAdmin = await tx.userAdmin.create({
                data: {
                    admin_id: data.admin_id ?? (0, uuid_1.v4)(),
                    role: data.role,
                    position: data.position,
                    updated_at: new Date(),
                    supervisor_id: data.supervisor_id,
                    User: { connect: { user_id: user.user_id } }
                }
            });
            return { user, userAdmin };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    async getUniqueUsername(username) {
        const result = await prisma_1.prisma.user.findFirst({ where: { username } });
        return result == null ? true : false;
    },
    async getUniqueEmail(email) {
        const result = await prisma_1.prisma.user.findFirst({ where: { email } });
        return result == null ? true : false;
    },
    async registerMerchant(data) {
        const { signup, branchInfo, address, branchAddress, payment } = data;
        const password_hash = await bcryptjs_1.default.hash(signup.password, 10);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    user_id: (0, uuid_1.v4)(),
                    username: signup.username,
                    fname: signup.fname,
                    lname: signup.lname,
                    email: signup.email,
                    password_hash,
                    phone: signup.phone,
                    role: client_1.UserRole.MERCHANT,
                    status: client_1.UserStatus.ACTIVE,
                    lang: signup.lang,
                    email_verified: false,
                    verification_token: (0, uuid_1.v4)(),
                    updated_at: new Date()
                }
            });
            const merchant = await tx.merchant.create({
                data: {
                    merchant_id: (0, uuid_1.v4)(),
                    owner_id: user.user_id,
                    business_name: signup.business_name,
                    phone: signup.phone,
                    email: signup.email,
                    description: branchInfo.description,
                    subscription_status: signup.plan,
                    auto_renewal: payment.auto_renewal,
                    updated_at: new Date()
                }
            });
            const staff = await tx.userMerchant.create({
                data: {
                    staff_id: (0, uuid_1.v4)(),
                    user_id: user.user_id,
                    merchant_id: merchant.merchant_id,
                    position: "Owner",
                    role: "OWNER"
                }
            });
            await tx.address.create({
                data: {
                    address_id: (0, uuid_1.v4)(),
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
            const branch = await tx.branch.create({
                data: {
                    branch_id: (0, uuid_1.v4)(),
                    contact_person_id: staff.staff_id,
                    merchant_id: merchant.merchant_id,
                    branch_name: branchInfo.branch_name,
                    phone: branchInfo.phone,
                    email: branchInfo.email,
                    description: branchInfo.description,
                    is_active: true,
                    updated_at: new Date(),
                }
            });
            const daysOfWeek = [
                client_1.DayOfWeek.MONDAY,
                client_1.DayOfWeek.TUESDAY,
                client_1.DayOfWeek.WEDNESDAY,
                client_1.DayOfWeek.THURSDAY,
                client_1.DayOfWeek.FRIDAY,
                client_1.DayOfWeek.SATURDAY,
                client_1.DayOfWeek.SUNDAY,
            ];
            const openingHoursData = daysOfWeek.map((day) => ({
                id: (0, uuid_1.v4)(),
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
            if (branchAddress) {
                await tx.address.create({
                    data: {
                        address_id: (0, uuid_1.v4)(),
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
            await tx.userMerchantOnBranch.create({
                data: {
                    staff_id: staff.staff_id,
                    branch_id: branch.branch_id,
                }
            });
            return { user, merchant, branch };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    async login(email, password) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new app_error_1.AppError("User not found", 404);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash ?? "");
            if (!isPasswordValid) {
                throw new app_error_1.AppError("Invalid password", 401);
            }
            if (user.role === client_1.UserRole.MERCHANT) {
                const userMerchant = await tx.userMerchant.findFirst({
                    where: { user_id: user.user_id },
                    include: {
                        Merchant: { select: { merchant_id: true } },
                        UserMerchantOnBranch: { select: { branch_id: true } }
                    }
                });
                if (!userMerchant) {
                    throw new app_error_1.AppError("User merchant not found", 404);
                }
                if (userMerchant?.UserMerchantOnBranch.length === 0) {
                    throw new app_error_1.AppError("User is not assigned to any branch", 403);
                }
                const merchant = await tx.merchant.findUnique({
                    where: { merchant_id: userMerchant.merchant_id },
                    include: { Branch: { select: { branch_id: true } } }
                });
                if (!merchant) {
                    throw new app_error_1.AppError("Merchant not found", 404);
                }
                return { user, merchant, userMerchant, redirect: "/merchant" };
            }
            if (user.role === client_1.UserRole.ADMIN) {
                const userAdmin = await tx.userAdmin.findUnique({
                    where: { user_id: user.user_id },
                });
                if (!userAdmin) {
                    throw new app_error_1.AppError("User admin not found", 404);
                }
                return { user, userAdmin, redirect: "/admin" };
            }
            return { user, redirect: "/" };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    async addNewEmployee(merchant_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const password_hash = await bcryptjs_1.default.hash(data.password, 10);
            const user = await tx.user.create({
                data: {
                    username: data.username,
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    phone: data.phone,
                    role: client_1.UserRole.MERCHANT,
                    password_hash,
                    status: client_1.UserStatus.ACTIVE,
                    lang: client_1.Lang.EN,
                    email_verified: false,
                    verification_token: (0, uuid_1.v4)(),
                    updated_at: new Date()
                }
            });
            const userMerchant = await tx.userMerchant.create({
                data: {
                    staff_id: data.staff_id ?? (0, uuid_1.v4)(),
                    user_id: user.user_id,
                    merchant_id,
                    position: data.position,
                    role: data.role
                }
            });
            const avatar = await tx.avatar.create({
                data: {
                    image_id: (0, uuid_1.v4)(),
                    user_id: user.user_id,
                    image_url: data.image_url ?? ""
                }
            });
            return { user, userMerchant, avatar };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    },
    async changePassword(user_id, data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { user_id } });
            if (!user) {
                throw new app_error_1.AppError("User not found", 404);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(data.old_password, user.password_hash ?? "");
            if (!isPasswordValid) {
                throw new app_error_1.AppError("Invalid password", 401);
            }
            const newPasswordHash = await bcryptjs_1.default.hash(data.new_password, 10);
            await tx.user.update({
                where: { user_id },
                data: { password_hash: newPasswordHash }
            });
            return { success: true };
        });
        return result;
    },
    async registerCustomer(data) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: data.username,
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    phone: data.phone,
                    role: client_1.UserRole.CUSTOMER,
                    status: client_1.UserStatus.ACTIVE,
                    lang: client_1.Lang.EN,
                    updated_at: new Date()
                }
            });
            return { user };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        return result;
    }
};
