'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { callApi } from '@/lib/api/client';
import { SITE_URL } from '@/lib/env';
import { SESSION_COOKIE, safeAdminPath } from '@/lib/session-cookie';

export type LoginState =
  | { status: 'idle' }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<'email' | 'password', string>>;
      /** The email is kept; the password never comes back. */
      email: string;
    };

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const result = await callApi((api) =>
    api.POST('/api/auth/login', { body: { email, password } }),
  );
  if (!result.ok) {
    return {
      status: 'error',
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      email,
    };
  }

  (await cookies()).set(SESSION_COOKIE, result.data.accessToken, {
    // Not readable by JavaScript, so an XSS bug cannot steal the token.
    httpOnly: true,
    sameSite: 'lax',
    // Secure cookies are dropped on plain-HTTP localhost.
    secure: SITE_URL.startsWith('https://'),
    path: '/',
    maxAge: result.data.expiresIn,
  });
  // Drop cached pages rendered for a signed-out visitor (e.g. the header).
  revalidatePath('/', 'layout');
  redirect(safeAdminPath(String(formData.get('next') ?? '')));
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/');
}
