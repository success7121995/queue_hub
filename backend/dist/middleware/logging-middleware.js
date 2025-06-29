"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = void 0;
const loggingMiddleware = async (req, res, next) => {
    const startTime = Date.now(); // Start timing the request
    // Capture the original end function to override it
    const originalEnd = res.end;
    // Override the end function to log the response time
    res.end = function (chunk, encoding, callback) {
        const responseTime = Date.now() - startTime; // Calculate response time
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || 'Unknown';
        // // Log the API request
        // adminService.createAPILog(req.method, req.originalUrl, res.statusCode, responseTime, ipAddress, userAgent, null, (req as any).user?.user_id).catch(console.error);
        // Call the original end function and return its result
        return originalEnd.call(this, chunk, encoding, callback);
    };
    // Proceed to the next middleware or route handler
    next();
};
exports.loggingMiddleware = loggingMiddleware;
