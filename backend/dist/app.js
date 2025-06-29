"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const logging_middleware_1 = require("./middleware/logging-middleware");
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./lib/socket"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// CORS configuration
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
// Port configuration
const port = process.env.PORT || 5500;
const app = (0, express_1.default)();
// HTTP server wrapper for Express
const server = (0, http_1.createServer)(app);
// Setup Socket.IO server with proper CORS
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    path: '/socket.io'
});
app.use((0, cors_1.default)(corsOptions));
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Session configuration
app.use((0, express_session_1.default)({
    name: 'session_id',
    secret: process.env.SESSION_SECRET,
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logging_middleware_1.loggingMiddleware);
// Attach socket.io instance to request object
app.use((req, res, next) => {
    req.io = io;
    next();
});
// Development-only: always set a session user if not present (Owner)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (!req.session.user) {
            req.session.user = {
                user_id: "d6ab0d83-3990-4083-9af7-a39de3fd3625",
                role: "MERCHANT",
                email: "joechan@gmail.com",
                merchant_id: "0c8f48b7-d4f3-467e-afd6-f610d9124b31",
                merchantRole: "OWNER"
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
//           user_id: "a4f9af6d-5d49-4aec-b267-1b5f3fffbac8",
//           role: "MERCHANT",
//           email: "tonytam@gmail.com",
//           merchant_id: "841d5921-64be-49df-907a-fb2f4c450218",
//           merchantRole: "MANAGER"
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
app.use("/api", routes_1.default);
// Register socket handlers
(0, socket_1.default)(io);
// Start server using the HTTP server instance
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Socket.IO server is running on path: /socket.io`);
});
