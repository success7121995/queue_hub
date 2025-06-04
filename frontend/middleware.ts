import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = [
    '/login',
    '/signup',
    '/features',
    '/',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/redirect',
];

// Helper function to check if a path is public
const isPublicPath = (path: string) => {
    return publicPaths.some(publicPath => 
        path === publicPath || 
        path.startsWith(`${publicPath}/`) ||
        path.startsWith('/api/auth/')
    );
};

export const middleware = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // For login and signup pages, check if user is already authenticated
    if (pathname === '/login' || pathname === '/signup') {
        try {
            // Verify session with backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-session`, {
                credentials: 'include',
                headers: {
                    Cookie: request.headers.get('cookie') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Session verification response:', data);

                // Handle admin roles first (including SUPER_ADMIN)
                if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'OPS_ADMIN' || data.user.role === 'SUPPORT_AGENT' || data.user.role === 'DEVELOPER') {
                    return NextResponse.redirect(new URL(`/dashboard/2a0b68db-d948-44d3-8967-ec3d106f31ff-1749016133439/view-live-queues`, request.url));
                }
                // Then handle merchant role
                else if (data.user.role === 'MERCHANT' && data.user.merchant_id) {
                    return NextResponse.redirect(new URL(`/dashboard/${data.user.merchant_id}/view-live-queues`, request.url));
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
        // If session check fails or user is not authenticated, allow access to login/signup
        return NextResponse.next();
    }

    // Allow other public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Check if the path is a private route
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        try {
            // Verify session with backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-session`, {
                credentials: 'include',
                headers: {
                    Cookie: request.headers.get('cookie') || '',
                },
            });

            if (!response.ok) {
                // Session is invalid, redirect to login
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('callbackUrl', pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Session is valid, proceed
            return NextResponse.next();
        } catch (error) {
            console.error('Auth error:', error);
            // On error, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // For all other routes, proceed
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /api/auth/* (auth endpoints)
         * 2. /_next/* (Next.js internals)
         * 3. /_vercel/* (Vercel internals)
         * 4. /favicon.ico, /sitemap.xml (static files)
         */
        '/((?!api/auth|_next|_vercel|favicon.ico|sitemap.xml).*)',
    ],
}; 