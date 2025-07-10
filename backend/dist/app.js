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
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:3000",
            "https://queue-hub.vercel.app",
            "https://queue-hub.vercel.app/"
        ];
        if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
            allowedOrigins.push(process.env.NEXT_PUBLIC_FRONTEND_URL);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200
};
const port = process.env.PORT || 5500;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    path: '/socket.io'
});
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, express_session_1.default)({
    name: 'session_id',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logging_middleware_1.loggingMiddleware);
app.use((req, res, next) => {
    req.io = io;
    next();
});
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (!req.session.user) {
            req.session.user = {
                user_id: "147a2b6a-8563-4360-a6e8-618358b09325",
                role: "ADMIN",
                email: "may@gmail.com",
                admin_id: "1",
                adminRole: "OPS_ADMIN"
            };
        }
        next();
    });
}
app.use("/api", routes_1.default);
(0, socket_1.default)(io);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Socket.IO server is running on path: /socket.io`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS Origin: ${corsOptions.origin}`);
});
