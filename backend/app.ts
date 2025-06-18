import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { loggingMiddleware } from "./middleware/logging-middleware";
import { Server } from "socket.io";
import registerSocketHandlers from "./lib/socket";
// Extend the Session type
declare module 'express-session' {
    interface SessionData {
        user: {
            user_id: string;
            email: string;
            role: string;
            merchant_id?: string;
            branch_id?: string;
            availableBranches: string[];
            merchantRole?: string;
        }
    }
}

dotenv.config();

// CORS configuration
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// Port configuration
const port = process.env.PORT || 5500;
const app = express();

// HTTP server wrapper for Express
const server = createServer(app);

// Setup Socket.IO server with proper CORS
const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io'
});

app.use(cors(corsOptions));

// Session configuration
app.use(session({
    name: 'session_id',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Development-only: always set a session user if not present
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (!req.session.user) {
      req.session.user = {
        user_id: "7d03546b-99e3-4da1-a0b8-3fc2747284a2",
        role: "MERCHANT",
        email: "joechan@gmail.com",
        merchant_id: "c8d1dddc-dad7-4042-a92b-78f5de897b7a",
        branch_id: "75e05c32-5610-4849-bed7-4c52d50b6b00",
        availableBranches: ["75e05c32-5610-4849-bed7-4c52d50b6b00"],
        merchantRole: "OWNER"
      };
    }
    next();
  });
}

// Routes
app.use("/api", router);

// Register socket handlers
registerSocketHandlers(io);

// Start server using the HTTP server instance
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Socket.IO server is running on path: /socket.io`);
});