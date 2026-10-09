import 'server-only';
import { cookies, headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import createClient, { type Client } from 'openapi-fetch';
import { API_INTERNAL_URL } from '@/lib/env';
import { SESSION_COOKIE } from '@/lib/session-cookie';
import { ApiError, type ApiResult } from './errors';
import type { components, paths } from './schema';

export type Schemas = components['schemas'];
export type Api = Client<paths>;

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * A typed client for one API call within the current request. It forwards
 * the admin token from the session cookie and the visitor's IP (the API
 * rate-limits per client, and every request reaches it from this server).
 *
 * Headers and the timeout are client options rather than middleware: a
 * middleware makes openapi-fetch generate a request id with Math.random(),
 * which Next.js rejects while prerendering.
 *
 * `credentials: 'omit'`: server-to-server calls carry no browser
 * credentials, and with the default Node's fetch treats a 401 answer to a
 * POST as a cue to resend the body, which fails ("expected non-null body
 * source") instead of returning the API's error, e.g. for a wrong password.
 */
async function createApi(): Promise<Api> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const forwardedFor = headerStore.get('x-forwarded-for');

  return createClient<paths>({
    baseUrl: API_INTERNAL_URL,
    credentials: 'omit',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
    },
  });
}

interface RawResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Runs one API call and turns every failure into an ApiError value instead
 * of an exception, so pages and actions can show the API's message.
 *
 *   const result = await callApi((api) => api.GET('/api/animals'));
 *   if (!result.ok) return <ErrorState error={result.error} />;
 */
export async function callApi<T>(
  request: (api: Api) => Promise<RawResult<T>>,
): Promise<ApiResult<T>> {
  const api = await createApi();
  let result: RawResult<T>;
  try {
    result = await request(api);
  } catch (cause) {
    // Next.js aborts pending fetches when a prerender ends; that is not an
    // API failure and must reach the framework.
    unstable_rethrow(cause);
    // Network error or timeout: the API is down or unreachable.
    console.error('API request failed', cause);
    return { ok: false, error: ApiError.unavailable() };
  }

  if (result.response.ok) {
    return { ok: true, data: result.data as T };
  }
  return { ok: false, error: toApiError(result.response, result.error) };
}

function toApiError(response: Response, body: unknown): ApiError {
  if (isErrorResponse(body)) {
    const fieldErrors = Object.fromEntries(
      (body.details ?? []).map((detail) => [detail.field, detail.message]),
    );
    return new ApiError(response.status, body.error, body.message, fieldErrors);
  }
  // Not the API's error format, e.g. a proxy error page.
  return response.status >= 500
    ? ApiError.unavailable()
    : new ApiError(
        response.status,
        'UNKNOWN',
        'Požiadavku sa nepodarilo spracovať.',
      );
}

function isErrorResponse(body: unknown): body is Schemas['ErrorResponseDto'] {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    'message' in body
  );
}
