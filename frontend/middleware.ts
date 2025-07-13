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

// Simplified middleware for Edge Runtime compatibility
export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const sessionId = req.cookies.get('session_id')?.value;

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

    // If accessing public paths, allow access
    if (isPublic) {
        return NextResponse.next();
    }

    // If no session, redirect to login
    if (!sessionId) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
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
