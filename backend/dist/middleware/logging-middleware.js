"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = void 0;
const loggingMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (chunk, encoding, callback) {
        const responseTime = Date.now() - startTime;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || 'Unknown';
        return originalEnd.call(this, chunk, encoding, callback);
    };
    next();
};
exports.loggingMiddleware = loggingMiddleware;
