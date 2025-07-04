import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { loggingMiddleware } from "./middleware/logging-middleware";
import { Server } from "socket.io";
import registerSocketHandlers from "./lib/socket";
import path from "path";
// Extend the Session type
declare module 'express-session' {
    interface SessionData {
        user: {
            user_id: string;
            email: string;
            role: string;
            merchant_id?: string;
            merchantRole?: string;
            adminRole?: string;
            admin_id?: string;
        }
    }
}

dotenv.config();

// CORS configuration
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

// Attach socket.io instance to request object
app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

// Development-only: always set a session user if not present (Owner)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (!req.session.user) {
      req.session.user = {
        user_id: "5469ca2a-83ba-4a0d-8265-17d763233975",
        role: "ADMIN",
        email: "success7121995@gmail.com",
        admin_id: "dfffad85-110d-4aba-a306-d3390aadf713",
        adminRole: "SUPER_ADMIN"
      };
    }
    next();
  });
}

// Development-only: always set a session user if not present (Manager)
// if (process.env.NODE_ENV === 'development') {
//     app.use((req, res, next) => {
//       if (!req.session.user) {
//         req.session.user = {
//           user_id: "6f697422-5f78-43fb-a5c9-46531af26b45",
//           role: "MERCHANT",
//           email: "joechan@gmail.com",
//           merchant_id: "dd327159-7921-43d5-bf4d-8e80ef13a501",
//           merchantRole: "OWNER"
//         };
//       }
//       next();
//     });
//   }

// Development-only: always set a session user if not present (SUPER_ADMIN)
// if (process.env.NODE_ENV === 'development') {
//     app.use((req, res, next) => {
//       if (!req.session.user) {
//         req.session.user = {
//           user_id: "be0d2494-9566-4659-a6e0-96697518cd32",
//           role: "ADMIN",
//           email: "success7121995@gmail.com",
//           admin_id: "55a3842b-90a2-4926-8dc2-abc4cd815dc8",
//           adminRole: "SUPER_ADMIN"
//         };
//       }
//       next();
//     });
//   }



// Routes
app.use("/api", router);

// Register socket handlers
registerSocketHandlers(io);

// Start server using the HTTP server instance
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Socket.IO server is running on path: /socket.io`);
});