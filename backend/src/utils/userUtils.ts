import { PrismaClient, User, UserRole, MerchantRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AppError } from "./app-error";

const prisma = new PrismaClient();

/**
 * Check if a user exists by email or username
 * @param email - The email of the user
 * @param username - The username of the user
 * @returns True if the user exists, false otherwise
 */
export async function checkUserExists(email: string, username: string): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
            username
        }
    });
    return !!existingUser;
}

/**
 * Validate the passwords
 * @param password - The password to validate
 * @param confirm_password - The confirm password to validate
 */
export async function validatePasswords(password: string, confirm_password: string): Promise<void> {
    if (password !== confirm_password) {
        throw new AppError("Password and confirm password do not match", 400);
    }
}

/**
 * Hash the password
 * @param password - The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const password_hash = await bcrypt.hash(password, 10);
    if (!password_hash) {
        throw new AppError("Failed to hash password", 400);
    }
    return password_hash;
}

/**
 * Validate the user access
 * @param user - The user to validate
 * @param allowedRoles - The allowed roles
 */
export async function validateUserAccess(
    user: { role?: UserRole; merchant_role?: MerchantRole } | null,
    allowedRoles: (UserRole | MerchantRole)[]
): Promise<void> {
    const userRole = user?.role || user?.merchant_role;

    // If the user is not found or the user role is not in the allowed roles, throw an error
    if (!user || !userRole || !allowedRoles.includes(userRole)) {
        throw new AppError("Unauthorized", 401);
    }
}

/**
 * Verify the password
 * @param password - The password to verify
 * @param hashedPassword - The hashed password to verify
 * @returns True if the password is correct, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Find a user by email
 * @param email - The email of the user
 * @returns The user if found, null otherwise
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { email }
    });
} 