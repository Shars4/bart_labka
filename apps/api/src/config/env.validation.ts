import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment the API needs to run. It is validated once at startup, so a
 * misconfigured container fails immediately instead of on the first request.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsString()
  @Matches(/^postgres(ql)?:\/\//, {
    message: 'DATABASE_URL must be a postgresql:// connection string',
  })
  DATABASE_URL: string;

  /** HMAC key for signing access tokens (HS256). */
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must have at least 32 characters' })
  JWT_SECRET: string;

  @IsInt()
  @Min(60)
  JWT_EXPIRES_IN_SECONDS: number = 8 * 60 * 60;

  /**
   * Requests allowed per window on rate-limited routes, counted per client
   * IP and route; on login also per account.
   */
  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX_REQUESTS: number = 5;

  @IsInt()
  @Min(1)
  RATE_LIMIT_WINDOW_SECONDS: number = 60;

  /**
   * Express "trust proxy" setting. By default only private networks are
   * trusted, i.e. the web container inside the Docker network, so the
   * client IP it forwards in X-Forwarded-For is used for rate limiting.
   * Set to "false" when the API is reachable directly from the internet.
   */
  @IsString()
  TRUST_PROXY: string = 'loopback, linklocal, uniquelocal';

  /** SMTP server for outgoing email; Mailpit in docker compose. */
  @IsString()
  SMTP_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT: number = 1025;

  /** Sender of all emails, e.g. "Útulok Labka <noreply@utulok.local>". */
  @IsString()
  MAIL_FROM: string = 'Útulok Labka <noreply@utulok.local>';

  /** Public URL of the website, for links in emails. */
  @Matches(/^https?:\/\/[^/]+$/, {
    message: 'WEB_URL must be an http(s) origin without a trailing slash',
  })
  WEB_URL: string = 'http://localhost:3000';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env);

  if (errors.length > 0) {
    const problems = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .map((problem) => `  - ${problem}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }

  return env;
}
