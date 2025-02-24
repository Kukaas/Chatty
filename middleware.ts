import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');

  // Protected routes that require authentication
  if (
    request.nextUrl.pathname.startsWith('/chat') ||
    request.nextUrl.pathname.startsWith('/friends') ||
    (request.nextUrl.pathname.startsWith('/api/friends') && 
     !request.nextUrl.pathname.startsWith('/api/friends/check-auth'))  // Don't protect check-auth
  ) {
    if (!authToken) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Public routes that should not be accessible when authenticated
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) &&
    authToken
  ) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/friends/:path*',
    '/api/friends/:path*',
    '/login',
    '/signup'
  ],
}; 