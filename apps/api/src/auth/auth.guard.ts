import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums.js';
import type {
  AuthUser,
  AuthenticatedRequest,
  JwtPayload,
} from './auth-user.js';
import { ACCESS_KEY, type Access } from './decorators.js';

/**
 * Global guard, deny by default: a route requires an admin access token
 * unless it is marked @Authenticated() (any signed-in account) or @Public().
 * A new endpoint therefore cannot be left open by forgetting a decorator.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const access =
      this.reflector.getAllAndOverride<Access | undefined>(ACCESS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'admin';
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);

    if (access === 'public') {
      // Optional sign-in: an expired or invalid token on a public route
      // means an anonymous visitor, not an error.
      request.user = token
        ? await this.verifyToken(token).catch(() => undefined)
        : undefined;
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Na túto akciu sa musíte prihlásiť.');
    }
    const user = await this.verifyToken(token).catch(() => {
      throw new UnauthorizedException(
        'Prihlásenie vypršalo alebo je neplatné. Prihláste sa znova.',
      );
    });
    if (access === 'admin' && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Na túto akciu nemáte oprávnenie.');
    }

    request.user = user;
    return true;
  }

  /** Accepts access tokens only (JwtModule pins their audience). */
  private async verifyToken(token: string): Promise<AuthUser> {
    const payload = await this.jwt.verifyAsync<JwtPayload>(token);
    return {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
  }
}

function extractBearerToken(request: AuthenticatedRequest): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}
