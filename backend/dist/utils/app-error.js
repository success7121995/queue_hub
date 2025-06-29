"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, status, error = null) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        this.name = this.constructor.name;
        this.status = status;
        this.error = error;
    }
}
exports.AppError = AppError;
