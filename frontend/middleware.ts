// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

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

    // For protected routes, let the client-side handle authentication
    // This prevents Edge Runtime issues with cross-origin cookies
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
