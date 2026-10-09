import bcrypt from 'bcryptjs';

/** bcrypt cost factor; 12 rounds take roughly 200 ms per hash. */
const BCRYPT_ROUNDS = 12;

/**
 * bcrypt silently ignores everything after the first 72 bytes, so longer
 * passwords would match any password sharing that prefix. Passwords that get
 * hashed must stay within the limit.
 */
export const MAX_PASSWORD_BYTES = 72;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
