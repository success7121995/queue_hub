// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirstAdminSlug, getFirstMerchantSlug, hasMerchantAccess, hasAdminAccess } from '@/lib/utils';

const PUBLIC_PATHS = [
    '/',
    '/about-us',
    '/features',
    '/privacy-policy',
    '/terms-of-service',
    '/contact-us',
    '/faq',
    '/unauthorized',
];  

// Auth pages that should redirect authenticated users
const AUTH_PATHS = ['/login', '/signup'];

// Simplified middleware for Edge Runtime compatibility
export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const sessionId = req.cookies.get('session_id')?.value;
    const role = req.cookies.get('role')?.value;

    // Exclude static asset paths from auth
    if (
        pathname.startsWith('/images/') ||
        pathname.startsWith('/fonts/') ||
        pathname.startsWith('/svg/') ||
        pathname === '/favicon.ico' ||
        pathname.startsWith('/public/')
    ) {
        return NextResponse.next();
    }

    const isPublic = PUBLIC_PATHS.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    const isAuthPage = AUTH_PATHS.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // If accessing public paths, allow access
    if (isPublic) {
        return NextResponse.next();
    }

    // If no session, redirect to login (except for auth pages)
    if (!sessionId) {
        if (isAuthPage) {
            // Allow access to auth pages when no session
            return NextResponse.next();
        }
        console.log('No session, redirecting to login');
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user has session and is trying to access auth pages, redirect to appropriate dashboard
    if (isAuthPage && sessionId) {
        console.log('Authenticated user accessing auth page, redirecting to dashboard');
        
        // Determine redirect based on role
        if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OPS_ADMIN' || role === 'SUPPORT_AGENT' || role === 'DEVELOPER') {
            const firstAdminSlug = getFirstAdminSlug();
            return NextResponse.redirect(new URL(`/admin/${firstAdminSlug}`, req.url));
        } else if (role === 'MERCHANT' || role === 'OWNER' || role === 'MANAGER' || role === 'FRONTLINE') {
            const firstMerchantSlug = getFirstMerchantSlug();
            return NextResponse.redirect(new URL(`/merchant/${firstMerchantSlug}`, req.url));
        } else {
            // Default redirect for unknown roles
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // For protected routes, let the client-side handle role-based access
    // This prevents Edge Runtime issues with fetch API
    return NextResponse.next();
};

// Enable middleware for all routes except static files and api routes
export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        // - images, fonts, svg, and public folders
        '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|svg|public).*)',
    ],
};
