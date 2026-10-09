/**
 * Token audiences. Both token kinds are signed with the same key, so the
 * audience is what keeps an email verification link from working as an
 * access token, and the other way round.
 */
export const ACCESS_TOKEN_AUDIENCE = 'access';
export const EMAIL_VERIFICATION_AUDIENCE = 'email-verification';

export const EMAIL_VERIFICATION_TTL_SECONDS = 24 * 60 * 60;

/** Claims of the token in the email verification link. */
export interface EmailVerificationPayload {
  sub: string;
  /** The link stops working if the account's email is not this one. */
  email: string;
}
