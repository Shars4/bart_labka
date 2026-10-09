import {
  type ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import type { AuthUser, AuthenticatedRequest } from './auth-user.js';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opts a route out of the global AuthGuard. Every route requires an admin
 * token unless it is explicitly marked public.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Injects the user authenticated by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      // Programming error: the route is public, so AuthGuard set no user.
      throw new Error('@CurrentUser() used on a route without authentication');
    }
    return request.user;
  },
);
