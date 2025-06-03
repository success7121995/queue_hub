import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { UserRole } from "@prisma/client";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-hander";

declare module 'express-session' {
    interface Session {
        user?: {
            userId: string;
            role: UserRole;
            username: string;
        };
    }
}

dotenv.config();

const app = express();

app.use(express.json());
app.use(session({
	name: "session_id",
	secret: process.env.SESSION_SECRET || "",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		sameSite: "strict",
		path: "/",
	}
}));

const port: number = parseInt(process.env.PORT || "5501");

// Routes
app.use('/api', routes);

// 404
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on http://localhost:${port}`);
});
