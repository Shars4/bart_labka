import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { callApi } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';
import { SESSION_COOKIE } from '@/lib/session-cookie';

export type User = components['schemas']['UserDto'];

export type Session =
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous' }
  | { status: 'error'; error: ApiError };

/**
 * The signed-in admin, verified by the API (GET /api/auth/me). Without a
 * session cookie the API is not called at all. Deduplicated per request.
 */
export const getSession = cache(async (): Promise<Session> => {
  const hasToken = (await cookies()).has(SESSION_COOKIE);
  if (!hasToken) {
    return { status: 'anonymous' };
  }
  const result = await callApi((api) => api.GET('/api/auth/me'));
  if (result.ok) {
    return { status: 'authenticated', user: result.data };
  }
  // An expired or revoked token is the same as being signed out.
  return result.error.status === 401
    ? { status: 'anonymous' }
    : { status: 'error', error: result.error };
});

/** Login URL that returns to `path` afterwards. */
export function loginUrl(path: string, reason?: 'expired'): string {
  const params = new URLSearchParams({ next: path });
  if (reason) {
    params.set('dovod', 'vyprsalo');
  }
  return `/prihlasenie?${params}`;
}

/**
 * For admin pages and actions: an API error 401 means the session ended
 * (token expired or account removed), so the admin is sent to log in again.
 * Other errors are returned for the page to show.
 */
export function redirectIfUnauthorized(
  error: ApiError,
  path: string,
): ApiError {
  if (error.status === 401) {
    redirect(loginUrl(path, 'expired'));
  }
  return error;
}
