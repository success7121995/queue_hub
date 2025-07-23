import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const MERCHANT_SLUGS = [
    "view-live-queues",
    "manage-queue-entries",
    "add-branch",
    "branch-info",
    "view-queue-history",
    "feedback",
    "register-new-user",
    "manage-users",
    "analytics",
    "system-health",
];

export const ADMIN_SLUGS = [
    "metrics",
    "system-health",
    "add-admin",
    "org-chart",
    "view-merchants",
    "approve-merchants",
    "tickets",
    "unresolved-tickets",
    "resolved-tickets",
    "assigned-tickets",
    "logs",
    "api-logs",
    "admin-actions",
    "login-logs",
    "notifications",
    "legal",
];

// Merchant role access rules
export const MERCHANT_ACCESS_RULES = {
    OWNER: ['view-live-queues', 'manage-queue-entries', 'add-branch', 'branch-info', 'view-queue-history', 'feedback', 'register-new-employee', 'manage-employees', 'analytics', 'system-health', 'profile', 'account', 'billing', 'settings', 'help-center'],
    MANAGER: ['view-live-queues', 'manage-queue-entries', 'branch-info', 'view-queue-history', 'feedback', 'register-new-employee', 'manage-employees', 'analytics', 'profile', 'account', 'settings', 'help-center'],
    FRONTLINE: ['view-live-queues', 'manage-queue-entries', 'view-queue-history', 'feedback', 'profile', 'account', 'settings', 'help-center']
} as const;

export const ADMIN_ACCESS_RULES = {
    SUPER_ADMIN: ['metrics', 'system-health', 'add-admin', 'org-chart', 'view-merchants', 'approve-merchants', 'tickets', 'unresolved-tickets', 'resolved-tickets', 'assigned-tickets', 'logs', 'api-logs', 'admin-actions', 'login-logs', 'notifications', 'legal', 'profile', 'account', 'settings'],
    OPS_ADMIN: ['metrics', 'system-health', 'add-admin', 'org-chart', 'view-merchants', 'approve-merchants', 'tickets', 'unresolved-tickets', 'resolved-tickets', 'assigned-tickets', 'logs', 'api-logs', 'admin-actions', 'login-logs', 'notifications', 'legal', 'profile', 'account', 'settings'],
    SUPPORT_AGENT: ['metrics', 'system-health', 'add-admin', 'org-chart', 'view-merchants', 'approve-merchants', 'tickets', 'unresolved-tickets', 'resolved-tickets', 'assigned-tickets', 'logs', 'api-logs', 'admin-actions', 'login-logs', 'notifications', 'legal', 'profile', 'account', 'settings'],
    DEVELOPER: ['metrics', 'system-health', 'add-admin', 'org-chart', 'view-merchants', 'approve-merchants', 'tickets', 'unresolved-tickets', 'resolved-tickets', 'assigned-tickets', 'logs', 'api-logs', 'admin-actions', 'login-logs', 'notifications', 'legal', 'profile', 'account', 'settings']
} as const;

export type MerchantRole = keyof typeof MERCHANT_ACCESS_RULES;
export type AdminRole = keyof typeof ADMIN_ACCESS_RULES;

/**
 * Check if a merchant role has access to a specific route
 * @param merchantRole - The merchant role to check
 * @param route - The route to check access for
 * @returns boolean indicating if access is allowed
 */
export const hasMerchantAccess = (merchantRole: MerchantRole | null | undefined, route: string): boolean => {
    if (!merchantRole || !MERCHANT_ACCESS_RULES[merchantRole]) {
        return false;
    }
    return MERCHANT_ACCESS_RULES[merchantRole].includes(route as any);
};

/**
 * Check if an admin role has access to a specific route
 * @param adminRole - The admin role to check
 * @param route - The route to check access for
 * @returns boolean indicating if access is allowed
 */
export const hasAdminAccess = (adminRole: AdminRole | null | undefined, route: string): boolean => {
    if (!adminRole || !ADMIN_ACCESS_RULES[adminRole]) {
        return false;
    }
    return ADMIN_ACCESS_RULES[adminRole].includes(route as any);
};

/**
 * Get allowed routes for a merchant role
 * @param merchantRole - The merchant role
 * @returns Array of allowed route slugs
 */
export const getAllowedRoutes = (merchantRole: MerchantRole | null | undefined): readonly string[] => {
    if (!merchantRole || !MERCHANT_ACCESS_RULES[merchantRole]) {
        return [];
    }
    return MERCHANT_ACCESS_RULES[merchantRole];
};

/**
 * Get allowed routes for an admin role
 * @param adminRole - The admin role
 * @returns Array of allowed route slugs
 */
export const getAllowedAdminRoutes = (adminRole: AdminRole | null | undefined): readonly string[] => {
    if (!adminRole || !ADMIN_ACCESS_RULES[adminRole]) {
        return [];
    }
    return ADMIN_ACCESS_RULES[adminRole];
};

/**
 * Merge class names with Tailwind CSS classes
 * @param inputs - Class names to merge
 * @returns Merged class names
 */
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
}

/**
 * Get the first merchant slug
 * @returns The first merchant slug
 */
export const getFirstMerchantSlug = (role: MerchantRole): string => {
    return MERCHANT_ACCESS_RULES[role][0];
}

export const getFirstAdminSlug = (role: AdminRole): string => {
    return ADMIN_ACCESS_RULES[role][0];
}

/**
 * Clean file name by removing timestamp prefixes
 * @param fileName - The file name to clean
 * @returns The cleaned file name
 */
export function cleanFileName(fileName: string): string {
    // Remove first two sets of numbers and dashes (e.g., 1751616157107-649198748-)
    return fileName.replace(/^\d+-\d+-/, '');
}

/**
 * Determine if a file is an image based on its extension
 * @param fileUrl - The file URL or name
 * @returns True if the file is an image
 */
export function isImageFile(fileUrl: string): boolean {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
}

/**
 * Check if a user is authenticated. If the user is authenticated, redirect to the appropriate dashboard.
 * @param user - The user to check
 * @returns True if the user is authenticated
 */
export const checkExistingSession = async (): Promise<{ isAuthenticated: boolean; user?: any }> => {
    try {
        // Server-side session validation - HttpOnly cookie is automatically sent
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500'}/api/auth/me`, {
            credentials: 'include',
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const authResponse = await response.json();
            const user = authResponse.user;
            
            if (user) {
                return { isAuthenticated: true, user };
            }
        } else if (response.status === 401) {
            // User is not authenticated - this is expected for login page
            console.log('User not authenticated, showing login form');
        } else {
            // Unexpected error
            console.error('Unexpected error during session validation:', response.status);
        }
    } catch (err) {
        // Network error or other exception
        console.error('Session validation failed:', err);
    }
    
    return { isAuthenticated: false };
}