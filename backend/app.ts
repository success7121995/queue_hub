import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import session from "express-session";
import { loggingMiddleware } from "./middleware/logging-middleware";

// Extend the Session type
declare module 'express-session' {
    interface SessionData {
        user: {
            userId: string;
            role: string;
            email: string;
            merchantId?: string;
            branchId?: string;
            availableBranches: string[];
            merchantRole?: string;
        }
    }
}

dotenv.config();

// CORS configuration
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    credentials: true,
};

// Port configuration
const port = process.env.PORT || 5000;

const app = express();

// Session configuration
app.use(session({
    name: 'session_id',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use("/api", router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});