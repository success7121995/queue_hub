import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
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

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
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