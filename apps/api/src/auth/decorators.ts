import {
  type ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import type { AuthUser, AuthenticatedRequest } from './auth-user.js';

export const ACCESS_KEY = 'access';

/**
 * Who may call a route. Without a decorator a route is admin-only, so a
 * new endpoint cannot be left open by forgetting one.
 */
export type Access = 'public' | 'authenticated' | 'admin';

/**
 * Anyone, signed in or not. A valid token still identifies the user (see
 * @OptionalUser()); a missing or invalid one means an anonymous visitor.
 */
export const Public = () => SetMetadata(ACCESS_KEY, 'public' satisfies Access);

/** Any signed-in account, ordinary user or admin. */
export const Authenticated = () =>
  SetMetadata(ACCESS_KEY, 'authenticated' satisfies Access);

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

/** On a @Public() route: the signed-in user, or undefined for a visitor. */
export const OptionalUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
