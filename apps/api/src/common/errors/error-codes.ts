import { HttpStatus } from '@nestjs/common';

/**
 * Machine-readable codes returned in the `error` field of every error
 * response. Generic codes mirror the HttpStatus names, so any status without
 * an explicit code still maps to a stable value. Domain codes refine a
 * status where the client needs to tell cases apart.
 */
export const ErrorCode = {
  // Domain-specific
  ValidationError: 'VALIDATION_ERROR',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  AnimalNotAvailable: 'ANIMAL_NOT_AVAILABLE',
  DuplicateAdoptionRequest: 'DUPLICATE_ADOPTION_REQUEST',
  AdoptionRequestAlreadyResolved: 'ADOPTION_REQUEST_ALREADY_RESOLVED',
  // Generic, by HTTP status
  BadRequest: 'BAD_REQUEST',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  PayloadTooLarge: 'PAYLOAD_TOO_LARGE',
  TooManyRequests: 'TOO_MANY_REQUESTS',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  ServiceUnavailable: 'SERVICE_UNAVAILABLE',
} as const;

export function errorCodeForStatus(status: number): string {
  return (
    (HttpStatus[status] as string | undefined) ?? ErrorCode.InternalServerError
  );
}

/** User-facing (Slovak) fallbacks used when an error carries no own message. */
const DEFAULT_MESSAGES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Požiadavka nie je platná.',
  [HttpStatus.UNAUTHORIZED]: 'Na túto akciu sa musíte prihlásiť.',
  [HttpStatus.FORBIDDEN]: 'Na túto akciu nemáte oprávnenie.',
  [HttpStatus.NOT_FOUND]: 'Požadovaný zdroj neexistuje.',
  [HttpStatus.CONFLICT]: 'Požiadavka je v konflikte s aktuálnym stavom údajov.',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Požiadavka je príliš veľká.',
  [HttpStatus.TOO_MANY_REQUESTS]:
    'Príliš veľa požiadaviek. Skúste to znova o chvíľu.',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Služba je dočasne nedostupná.',
};

export function defaultMessageForStatus(status: number): string {
  return (
    DEFAULT_MESSAGES[status] ??
    (status >= 500
      ? 'Na serveri nastala neočakávaná chyba. Skúste to znova neskôr.'
      : 'Požiadavku nebolo možné spracovať.')
  );
}
