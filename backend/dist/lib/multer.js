"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.uploadGalleries = exports.uploadFeatureImage = exports.uploadLogo = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'public', 'uploads');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (jpeg, png, webp, svg)'), false);
    }
};
const limits = { fileSize: 10 * 1024 * 1024 };
exports.uploadLogo = (0, multer_1.default)({ storage, fileFilter, limits }).single('LOGO');
exports.uploadFeatureImage = (0, multer_1.default)({ storage, fileFilter, limits }).single('FEATURE_IMAGE');
exports.uploadGalleries = (0, multer_1.default)({ storage, fileFilter, limits }).array('IMAGE', 10);
exports.uploadAvatar = (0, multer_1.default)({ storage, fileFilter, limits }).single('AVATAR');
