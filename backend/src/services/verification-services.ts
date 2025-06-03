import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { insertActivityLog } from "../utils/activity-log";

const prisma = new PrismaClient();

/**
 * Generate a verify link
 * @param email - The email of the user
 * @returns The verify link
 */
export const generateVerifyLink = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
}