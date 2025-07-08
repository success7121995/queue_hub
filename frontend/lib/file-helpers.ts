/**
 * File validation and handling utilities
 */

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type and size
 * @param file - The file to validate
 * @returns Object with validation result and error message if any
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'Only images (JPEG, PNG, WebP, SVG) and PDF files are allowed.'
        };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: 'File size must be less than 10MB.'
        };
    }
    
    return { isValid: true };
}

/**
 * Create a preview URL for an image file
 * @param file - The image file
 * @returns The preview URL
 */
export function createImagePreview(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Clean up a preview URL to prevent memory leaks
 * @param url - The preview URL to revoke
 */
export function revokeImagePreview(url: string): void {
    URL.revokeObjectURL(url);
} 