import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateRedirectToken = async (userId: string): Promise<string> => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "5m" }
    );

    // Store token in database for validation
    await prisma.session.create({
        data: {
            id: token,
            data: JSON.stringify({ userId }),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
    });

    return token;
}; 