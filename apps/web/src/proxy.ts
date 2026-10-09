import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, homeFor, unverifiedRole } from '@/lib/session-cookie';

/**
 * Optimistic checks only, before anything renders:
 * - without a session cookie, signed-in pages redirect to the login page;
 * - an ordinary user opening the admin area goes to their own page.
 * Whether the token is valid, and its role, is decided by the API on every
 * request.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const login = new URL('/prihlasenie', request.url);
    login.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }

  const role = unverifiedRole(token);
  if (request.nextUrl.pathname.startsWith('/admin') && role === 'USER') {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/moje-ziadosti'],
};
