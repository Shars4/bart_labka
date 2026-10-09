'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { callApi } from '@/lib/api/client';
import { SITE_URL } from '@/lib/env';
import { SESSION_COOKIE, homeFor, safeNextPath } from '@/lib/session-cookie';

export type LoginState =
  | { status: 'idle' }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<'email' | 'password', string>>;
      /** The email is kept; the password never comes back. */
      email: string;
      /** Right password, but the email is not verified yet. */
      unverified: boolean;
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
      unverified: result.error.code === 'EMAIL_NOT_VERIFIED',
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
  redirect(
    safeNextPath(String(formData.get('next') ?? '')) ??
      homeFor(result.data.user.role),
  );
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/');
}

type RegisterField = 'name' | 'email' | 'password';

export type RegisterState =
  | { status: 'idle' }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<RegisterField, string>>;
      /** Typed values are kept, except the password. */
      values: { name: string; email: string };
    }
  | { status: 'registered'; email: string };

export async function register(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const result = await callApi((api) =>
    api.POST('/api/auth/register', { body: { name, email, password } }),
  );
  if (!result.ok) {
    return {
      status: 'error',
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values: { name, email },
    };
  }
  return { status: 'registered', email: result.data.email };
}

export type ResendState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; message: string };

/** The API answers the same for every email, so does this action. */
export async function resendVerification(
  _previous: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = String(formData.get('email') ?? '');
  const result = await callApi((api) =>
    api.POST('/api/auth/resend-verification', { body: { email } }),
  );
  return result.ok
    ? { status: 'sent' }
    : { status: 'error', message: result.error.message };
}
