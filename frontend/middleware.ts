// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirstAdminSlug, getFirstMerchantSlug } from '@/lib/utils';

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
];  

const ADMIN_ROLES = ['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER'];

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
        return data.user?.role || null;
    } catch {
        return null;
    }
};

export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const sessionId = req.cookies.get('session_id')?.value;

    const isPublic = PUBLIC_PATHS.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (sessionId) {
        // Fetch user role from backend
        const role = await getUserRole(req);

        // If accessing /login or /signup, always redirect to dashboard if session is set and role is known
        if (pathname === '/login' || pathname === '/signup') {
            if (ADMIN_ROLES.includes(role)) {
                const firstAdminSlug = getFirstAdminSlug?.() || '';
                return NextResponse.redirect(new URL(`/admin/${firstAdminSlug}`, req.url));
            } else if (role === 'MERCHANT') {
                const firstMerchantSlug = getFirstMerchantSlug?.() || '';
                return NextResponse.redirect(new URL(`/merchant/${firstMerchantSlug}`, req.url));
            } else {
                // If role is unknown, do nothing (stay on the page)
                return NextResponse.next();
            }
        }

        // Role-based route protection for authenticated users
        if (pathname.startsWith('/admin')) {
            if (!role) return NextResponse.next(); // If role is unknown, do nothing
            if (!ADMIN_ROLES.includes(role)) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        }
        if (pathname.startsWith('/merchant')) {
            if (!role) return NextResponse.next(); // If role is unknown, do nothing
            if (role !== 'MERCHANT') {
                return NextResponse.redirect(new URL('/login', req.url));
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
