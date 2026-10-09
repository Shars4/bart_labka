import { type ExecutionContext, SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { type ThrottlerModuleOptions, seconds } from '@nestjs/throttler';
import type { EnvironmentVariables } from '../../config/env.validation.js';

const RATE_LIMITED_KEY = 'rateLimited';
const reflector = new Reflector();

interface RateLimitOptions {
  /**
   * Also limit each account (the `email` in the request body), whatever IP
   * the requests come from. The client IP is taken from X-Forwarded-For,
   * which a client can forge unless a reverse proxy in front of the web
   * overwrites it; the account limit still stops password guessing then.
   */
  perAccount?: boolean;
}

/**
 * Limits a route to RATE_LIMIT_MAX_REQUESTS per RATE_LIMIT_WINDOW_SECONDS
 * for each client IP. Meant for sensitive public endpoints such as login.
 * Other routes are not throttled.
 */
export const RateLimited = (options: RateLimitOptions = {}) =>
  SetMetadata(RATE_LIMITED_KEY, options);

function rateLimitOf(context: ExecutionContext): RateLimitOptions | undefined {
  return reflector.get<RateLimitOptions | undefined>(
    RATE_LIMITED_KEY,
    context.getHandler(),
  );
}

/** Normalized like LoginDto, so "Admin@X.sk " and "admin@x.sk" share a limit. */
function accountOf(req: Record<string, unknown>): string {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  return typeof email === 'string'
    ? `account:${email.trim().toLowerCase()}`
    : `ip:${String(req.ip)}`;
}

export function throttlerOptionsFactory(
  config: ConfigService<EnvironmentVariables, true>,
): ThrottlerModuleOptions {
  const limit = config.get('RATE_LIMIT_MAX_REQUESTS', { infer: true });
  const ttl = seconds(config.get('RATE_LIMIT_WINDOW_SECONDS', { infer: true }));

  return [
    {
      name: 'ip',
      limit,
      ttl,
      skipIf: (context) => rateLimitOf(context) === undefined,
    },
    {
      name: 'account',
      limit,
      ttl,
      skipIf: (context) => rateLimitOf(context)?.perAccount !== true,
      getTracker: (req) => accountOf(req),
    },
  ];
}
