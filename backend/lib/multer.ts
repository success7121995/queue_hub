import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Ensure the directory is writable
try {
    fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
} catch (error) {
    console.error('Upload directory is not writable:', UPLOAD_DIR);
    throw new Error('Upload directory is not writable');
}

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: any) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: any) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

/**
 * File filter
 * @param req - The request object
 * @param file - The file object
 * @param cb - The callback function
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: any, acceptPDF: boolean = false) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, png, webp, svg)'), false);
    }
};

const limits = { fileSize: 10 * 1024 * 1024 };

export const uploadLogo = multer({ storage, fileFilter, limits }).single('LOGO');
export const uploadFeatureImage = multer({ storage, fileFilter, limits }).single('FEATURE_IMAGE');
export const uploadGalleries = multer({ storage, fileFilter, limits }).array('IMAGE', 10);
export const uploadAvatar = multer({ storage, fileFilter, limits }).single('AVATAR'); 
export const uploadTicketFiles = multer({ storage, fileFilter, limits }).array('FILES', 10);
export const uploadChatAttachment = multer({ storage, fileFilter, limits }).single('ATTACHMENT');