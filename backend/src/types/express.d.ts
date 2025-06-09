import { User } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                merchant_id?: string;
                role: string;
            };
        }
    }
} 