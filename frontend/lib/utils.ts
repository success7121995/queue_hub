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
export const getFirstMerchantSlug = (): string => {
    return MERCHANT_SLUGS[0];
}

export const getFirstAdminSlug = (): string => {
    return ADMIN_SLUGS[0];
}