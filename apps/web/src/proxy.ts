import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session-cookie';

/**
 * Optimistic check only: without a session cookie the admin area redirects
 * to the login page before anything renders. Whether the token is valid is
 * decided by the API on every request.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  const login = new URL('/prihlasenie', request.url);
  login.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
