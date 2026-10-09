/**
 * httpOnly cookie with the signed-in user's access token, and helpers that
 * work without server-only code, so proxy.ts can use them too.
 */
export const SESSION_COOKIE = 'labka_session';

export type Role = 'ADMIN' | 'USER';

/** Where each role lands after signing in. */
export function homeFor(role: Role): string {
  return role === 'ADMIN' ? '/admin' : '/moje-ziadosti';
}

/**
 * A post-login target is accepted only as a path on this site, so
 * `?next=https://evil.example` cannot turn the login into an open redirect.
 */
export function safeNextPath(path: string | null | undefined): string | null {
  if (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\')
  ) {
    return path;
  }
  return null;
}

/**
 * The role claim of the token, read WITHOUT verifying the signature. Only
 * for routing decisions such as hiding the admin area from ordinary users;
 * the API verifies the token and the role on every request.
 */
export function unverifiedRole(token: string): Role | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replaceAll('-', '+').replaceAll('_', '/'));
    const role = (JSON.parse(json) as { role?: unknown }).role;
    return role === 'ADMIN' || role === 'USER' ? role : null;
  } catch {
    return null;
  }
}
