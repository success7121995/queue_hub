import { NextRequest, NextResponse } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = [
    '/login',
    '/signup',
    '/features',
    '/privacy-policy',
    '/terms-of-service',
    '/about-us',
    '/',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/redirect',
];

// Helper function to check if a path is public
const isPublicPath = (pathname: string) => {
    return pathname === '/' || 
           pathname === '/login' || 
           pathname === '/signup' || 
           pathname.startsWith('/api/') ||
           pathname.startsWith('/_next/') ||
           pathname.startsWith('/static/');
};

export const middleware = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // For login and signup pages, allow access
    if (pathname === '/login' || pathname === '/signup') {
        return NextResponse.next();
    }

    // Allow other public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // For private routes, check for session cookie
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        const sessionCookie = request.cookies.get('session_id');
        
        if (!sessionCookie) {
            // No session cookie, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Session cookie exists, proceed
        return NextResponse.next();
    }

    // For all other routes, proceed
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 