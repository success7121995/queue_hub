import { Request, Response } from "express";
import { getMerchant } from "../services/merchant-services";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { generateRedirectToken } from "../utils/auth";

const prisma = new PrismaClient();

/**
 * View merchant
 * @param req - The request object
 * @param res - The response object
 */
export const viewMerchant = async (req: Request, res: Response) => {
    const sessionUser = req.session.user;

    const merchant = await getMerchant(sessionUser?.merchant_id || '');

    res.status(200).json({
        message: "Merchant fetched successfully",
        success: true,
        merchant
    });
}

export const merchantSignup = async (req: Request, res: Response) => {
    try {
        const {
            signup,
            branchInfo,
            address,
            branchAddress,
            payment
        } = req.body;

        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const hashedPassword = await bcrypt.hash(signup.password, 10);
            const user = await tx.user.create({
                data: {
                    username: signup.username,
                    fname: signup.fname,
                    lname: signup.lname,
                    email: signup.email,
                    phone: signup.phone,
                    password_hash: hashedPassword,
                    role: "MERCHANT",
                    status: "ACTIVE",
                    lang: signup.lang,
                    email_verified: false,
                    verification_token: uuidv4()
                }
            });

            // Create merchant
            const merchant = await tx.merchant.create({
                data: {
                    owner_id: user.user_id,
                    business_name: signup.business_name,
                    phone: signup.phone,
                    email: signup.email,
                    subscription_status: signup.plan,
                    subscription_start: new Date(),
                    subscription_end: signup.plan === "TRIAL" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                    auto_renewal: payment?.auto_renewal || false,
                    address: {
                        create: {
                            street: address.street,
                            unit: address.unit,
                            floor: address.floor,
                            city: address.city,
                            state: address.state,
                            zip: address.zip,
                            country: address.country
                        }
                    }
                }
            });

            // Create branch if branch info is provided
            if (branchInfo) {
                const branch = await tx.branch.create({
                    data: {
                        merchant_id: merchant.merchant_id,
                        branch_name: branchInfo.branch_name,
                        phone: branchInfo.phone,
                        email: branchInfo.email,
                        description: branchInfo.description,
                        address: {
                            create: {
                                street: branchAddress?.street || address.street,
                                unit: branchAddress?.unit || address.unit,
                                floor: branchAddress?.floor || address.floor,
                                city: branchAddress?.city || address.city,
                                state: branchAddress?.state || address.state,
                                zip: branchAddress?.zip || address.zip,
                                country: branchAddress?.country || address.country
                            }
                        },
                        opening_hours: branchInfo.opening_hours ? {
                            create: branchInfo.opening_hours.map((hour: any) => ({
                                day_of_week: hour.day_of_week,
                                open_time: hour.open_time,
                                close_time: hour.close_time,
                                is_closed: hour.is_closed
                            }))
                        } : undefined
                    }
                });
            }

            // Create payment record if payment info is provided
            if (payment && signup.plan !== "TRIAL") {
                await tx.invoice.create({
                    data: {
                        merchant_id: merchant.merchant_id,
                        invoice_number: `INV-${Date.now()}`,
                        amount: signup.plan === "ESSENTIAL" ? 50 : 75,
                        currency: "USD",
                        status: "PAID",
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        paid_date: new Date(),
                        billing_period_start: new Date(),
                        billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        payment_method: "CARD",
                        transaction_id: payment.card_token || uuidv4(),
                        auto_renewal: payment.auto_renewal
                    }
                });
            }

            return { user, merchant };
        });

        // Generate redirect token
        const redirectToken = await generateRedirectToken(result.user.user_id);

        res.status(201).json({
            success: true,
            message: "Merchant signup successful",
            redirect_token: redirectToken
        });
    } catch (error: any) {
        console.error("Merchant signup error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create merchant account"
        });
    }
};

export const addBranch = async (req: Request, res: Response) => {
    try {
        const { merchant_id } = req.user as { merchant_id: string };
        const { branchInfo, address, payment } = req.body;

        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create branch
            const branch = await tx.branch.create({
                data: {
                    merchant_id,
                    branch_name: branchInfo.branch_name,
                    phone: branchInfo.phone,
                    email: branchInfo.email,
                    description: branchInfo.description,
                    address: {
                        create: {
                            street: address.street,
                            unit: address.unit,
                            floor: address.floor,
                            city: address.city,
                            state: address.state,
                            zip: address.zip,
                            country: address.country
                        }
                    },
                    opening_hours: branchInfo.opening_hours ? {
                        create: branchInfo.opening_hours.map((hour: any) => ({
                            day_of_week: hour.day_of_week,
                            open_time: hour.open_time,
                            close_time: hour.close_time,
                            is_closed: hour.is_closed
                        }))
                    } : undefined
                }
            });

            // Create payment record if payment info is provided
            if (payment) {
                const merchant = await tx.merchant.findUnique({
                    where: { merchant_id }
                });

                if (merchant?.subscription_status === "TRIAL") {
                    await tx.merchant.update({
                        where: { merchant_id },
                        data: {
                            subscription_status: "ESSENTIAL",
                            subscription_start: new Date(),
                            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            auto_renewal: payment.auto_renewal
                        }
                    });

                    await tx.invoice.create({
                        data: {
                            merchant_id,
                            invoice_number: `INV-${Date.now()}`,
                            amount: 50,
                            currency: "USD",
                            status: "PAID",
                            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            paid_date: new Date(),
                            billing_period_start: new Date(),
                            billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            payment_method: "CARD",
                            transaction_id: payment.card_token || uuidv4(),
                            auto_renewal: payment.auto_renewal
                        }
                    });
                }
            }

            return { branch };
        });

        // Generate redirect token
        const redirectToken = await generateRedirectToken(req.user?.user_id as string);

        res.status(201).json({
            success: true,
            message: "Branch added successfully",
            redirect_token: redirectToken
        });
    } catch (error: any) {
        console.error("Add branch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add branch"
        });
    }
};

export const addAdmin = async (req: Request, res: Response) => {
    try {
        const { userInfo, accountSetup } = req.body;

        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const hashedPassword = await bcrypt.hash(accountSetup.password, 10);
            const user = await tx.user.create({
                data: {
                    username: accountSetup.username,
                    fname: userInfo.fname,
                    lname: userInfo.lname,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    password_hash: hashedPassword,
                    role: "OPS_ADMIN",
                    status: "ACTIVE",
                    lang: accountSetup.lang,
                    email_verified: false,
                    verification_token: uuidv4()
                }
            });

            return { user };
        });

        // Generate redirect token
        const redirectToken = await generateRedirectToken(result.user.user_id);

        res.status(201).json({
            success: true,
            message: "Admin added successfully",
            redirect_token: redirectToken
        });
    } catch (error: any) {
        console.error("Add admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add admin"
        });
    }
};

export const addEmployee = async (req: Request, res: Response) => {
    try {
        const { merchant_id } = req.user as { merchant_id: string };
        const { userInfo, accountSetup } = req.body;

        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const hashedPassword = await bcrypt.hash(accountSetup.password, 10);
            const user = await tx.user.create({
                data: {
                    username: accountSetup.username,
                    fname: userInfo.fname,
                    lname: userInfo.lname,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    password_hash: hashedPassword,
                    role: "MERCHANT",
                    status: "ACTIVE",
                    lang: accountSetup.lang,
                    email_verified: false,
                    verification_token: uuidv4()
                }
            });

            // Create merchant staff record
            await tx.userMerchant.create({
                data: {
                    user_id: user.user_id,
                    merchant_id,
                    position: userInfo.position,
                    role: userInfo.role
                }
            });

            return { user };
        });

        // Generate redirect token
        const redirectToken = await generateRedirectToken(result.user.user_id);

        res.status(201).json({
            success: true,
            message: "Employee added successfully",
            redirect_token: redirectToken
        });
    } catch (error: any) {
        console.error("Add employee error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add employee"
        });
    }
};