import type { Request } from 'express';
import type { Role } from '../generated/prisma/enums.js';

/** Claims stored in the access token. */
export interface JwtPayload {
  /** User id; a string, as the JWT spec requires for `sub`. */
  sub: string;
  email: string;
  role: Role;
}

/** The authenticated user, attached to the request by AuthGuard. */
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
