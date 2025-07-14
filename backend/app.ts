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
import { prisma } from './lib/prisma';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// CORS configuration
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "http://localhost:3000",
            "https://queue-hub.vercel.app",
        ];
        
        // Add the environment variable if it exists
        if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
            allowedOrigins.push(process.env.NEXT_PUBLIC_FRONTEND_URL);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('CORS allowed origin:', origin);
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            console.log('Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Origin", "Accept"],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    optionsSuccessStatus: 200
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

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// Session configuration
app.use(session({
    name: 'session_id',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
          checkPeriod: 2 * 60 * 1000,  // Remove expired sessions every 2 minutes
          dbRecordIdIsSessionId: false, // Use 'sid' field instead of 'id' field
          dbRecordIdFunction: undefined,
        }
    ),
    cookie: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true, // Add httpOnly for security
    },
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

// Development-only: always set a session user if not present (SUPER_ADMIN)
// if (process.env.NODE_ENV === 'development') {
//     app.use((req, res, next) => {
//       if (!req.session.user) {
//         req.session.user = {
//           user_id: "147a2b6a-8563-4360-a6e8-618358b09325",
//           role: "ADMIN",
//           email: "may@gmail.com",
//           admin_id: "1",
//           adminRole: "OPS_ADMIN"
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
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS Origin: ${corsOptions.origin}`);
});