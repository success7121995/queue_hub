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
    'metrics',
    'system-health',
    'add-admin',
    'org-chart',
    'view-merchants',
    'approve-merchants',
    'tickets',
    'unresolved-tickets',
    'resolved-tickets',
    'assigned-tickets',
    'logs',
    'api-logs',
    'admin-actions',
    'login-logs',
    'notifications',
    'legal'
];

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
export const getFirstMerchantSlug = (): string => {
    return MERCHANT_SLUGS[0];
}

export const getFirstAdminSlug = (): string => {
    return ADMIN_SLUGS[0];
}