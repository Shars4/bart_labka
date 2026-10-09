/**
 * An error returned by the API (or the API being unreachable), with the
 * user-facing Slovak message from the API's unified error format. Safe to
 * import from client components: it carries no secrets.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Message per invalid field, from the `details` of a validation error. */
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static unavailable(): ApiError {
    return new ApiError(
      503,
      'SERVICE_UNAVAILABLE',
      'Služba útulku je dočasne nedostupná. Skúste to znova o chvíľu.',
    );
  }
}

export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ApiError };
