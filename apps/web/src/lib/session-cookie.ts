/**
 * httpOnly cookie with the admin's access token. Kept in its own module so
 * proxy.ts can use the name without importing server-only code.
 */
export const SESSION_COOKIE = 'labka_session';

/** Only paths inside the admin area are allowed as a post-login target. */
export function safeAdminPath(path: string | null | undefined): string {
  if (
    typeof path === 'string' &&
    path.startsWith('/admin') &&
    !path.startsWith('//') &&
    !path.includes('\\')
  ) {
    return path;
  }
  return '/admin';
}
