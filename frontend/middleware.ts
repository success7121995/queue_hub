// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirstAdminSlug, getFirstMerchantSlug, hasMerchantAccess, hasAdminAccess } from '@/lib/utils';

const PUBLIC_PATHS = [
    '/',
    '/about-us',
    '/features',
    '/login',
    '/privacy-policy',
    '/terms-of-service',
    '/signup',
    '/contact-us',
    '/faq',
    '/unauthorized',
];  

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER'];

const getUserRole = async (req: NextRequest) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
            headers: {
                cookie: req.headers.get('cookie') || '',
            },
            credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
            userRole: data.user?.role || null,
            merchantRole: data.user?.UserMerchant?.role || null,
            adminRole: data.user?.UserAdmin?.role || null
        };
    } catch {
        return null;
    }
};

const isMerchantRouteAllowed = (merchantRole: string, pathname: string): boolean => {
    const currentSlug = pathname.split('/').pop();
    return hasMerchantAccess(merchantRole as any, currentSlug || '');
};

const isAdminRouteAllowed = (adminRole: string, pathname: string): boolean => {
    const currentSlug = pathname.split('/').pop();
    return hasAdminAccess(adminRole as any, currentSlug || '');
};

export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const sessionId = req.cookies.get('session_id')?.value;

    const isPublic = PUBLIC_PATHS.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (sessionId) {
        // Fetch user role from backend
        const roleData = await getUserRole(req);
        const userRole = roleData?.userRole;
        const merchantRole = roleData?.merchantRole;
        const adminRole = roleData?.adminRole;

        // If accessing /login or /signup, always redirect to dashboard if session is set and role is known
        if (pathname === '/login' || pathname === '/signup') {
            if (ADMIN_ROLES.includes(userRole)) {
                const firstAdminSlug = getFirstAdminSlug?.() || '';
                return NextResponse.redirect(new URL(`/admin/${firstAdminSlug}`, req.url));
            } else if (userRole === 'MERCHANT') {
                const firstMerchantSlug = getFirstMerchantSlug?.() || '';
                return NextResponse.redirect(new URL(`/merchant/${firstMerchantSlug}`, req.url));
            } else {
                // If role is unknown, do nothing (stay on the page)
                return NextResponse.next();
            }
        }

        // Role-based route protection for authenticated users
        if (pathname.startsWith('/admin')) {
            if (!userRole) return NextResponse.next(); // If role is unknown, do nothing
            if (!ADMIN_ROLES.includes(userRole)) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
            
            // Check admin role-based access for specific admin routes
            if (pathname.includes('/admin/') && pathname.split('/').length > 2) {
                if (!isAdminRouteAllowed(adminRole, pathname)) {
                    return NextResponse.redirect(new URL('/404', req.url));
                }
            }
        }
        
        if (pathname.startsWith('/merchant')) {
            if (!userRole) return NextResponse.next(); // If role is unknown, do nothing
            if (userRole !== 'MERCHANT') {
                return NextResponse.redirect(new URL('/login', req.url));
            }
            
            // Check merchant role-based access for specific merchant routes
            if (pathname.includes('/merchant/') && pathname.split('/').length > 2) {
                if (!isMerchantRouteAllowed(merchantRole, pathname)) {
                    return NextResponse.redirect(new URL('/404', req.url));
                }
            }
        }
        
        // If session is set, allow access to all other pages
        return NextResponse.next();
    } else {
        // Redirect unauthenticated users to login for protected routes
        if (!isPublic) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
        // Allow access to public pages
        return NextResponse.next();
    }
};

// Enable middleware for all routes except static files and api routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
