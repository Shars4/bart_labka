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
import type { AuthenticatedRequest, JwtPayload } from './auth-user.js';
import { IS_PUBLIC_KEY } from './decorators.js';

/**
 * Global guard: every route requires a valid admin access token unless it is
 * marked with @Public(). Deny-by-default means a new endpoint cannot be left
 * unprotected by forgetting a decorator.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Na túto akciu sa musíte prihlásiť.');
    }

    const payload = await this.verifyToken(token);
    // Only admins can sign in today. Checking the role anyway keeps the
    // protected routes admin-only if another role is ever introduced.
    if (payload.role !== Role.ADMIN) {
      throw new ForbiddenException('Na túto akciu nemáte oprávnenie.');
    }

    request.user = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
    return true;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Prihlásenie vypršalo alebo je neplatné. Prihláste sa znova.',
      );
    }
  }
}

function extractBearerToken(request: AuthenticatedRequest): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}
