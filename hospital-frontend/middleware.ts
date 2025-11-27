// hospital-frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/patients/login',
    '/hospital/login',
    '/bank/login',
    '/register',
  ];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get session from cookies (client-side auth uses localStorage, but we check URL patterns)
  // Route-based role checking
  const patientRoutes = pathname.startsWith('/patients');
  const hospitalRoutes = pathname.startsWith('/hospital') && !pathname.includes('/login');
  const bankRoutes = pathname.startsWith('/bank') && !pathname.includes('/login');

  // If accessing protected routes without specific role paths, redirect to login
  if (patientRoutes || hospitalRoutes || bankRoutes) {
    // These checks happen client-side via getCurrentUser() in each page
    // Middleware just allows them to load
    return NextResponse.next();
  }

  // For unmatched routes, redirect to appropriate login
  const url = request.nextUrl.clone();
  url.pathname = '/patients/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.js).*)',
  ],
};