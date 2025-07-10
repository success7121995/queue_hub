"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_1 = __importDefault(require("./admin-routes"));
const merchant_routes_1 = __importDefault(require("./merchant-routes"));
const user_routes_1 = __importDefault(require("./user-routes"));
const customer_routes_1 = __importDefault(require("./customer-routes"));
const message_routes_1 = __importDefault(require("./message-routes"));
const gemini_routes_1 = __importDefault(require("./gemini-routes"));
const router = (0, express_1.Router)();
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});
router.use("/auth", user_routes_1.default);
router.use("/admin", admin_routes_1.default);
router.use("/merchant", merchant_routes_1.default);
router.use("/user", user_routes_1.default);
router.use("/customer", customer_routes_1.default);
router.use("/message", message_routes_1.default);
router.use("/gemini", gemini_routes_1.default);
exports.default = router;
