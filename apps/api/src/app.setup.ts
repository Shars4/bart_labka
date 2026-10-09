import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { validationExceptionFactory } from './common/validation/validation-exception.factory.js';
import type { EnvironmentVariables } from './config/env.validation.js';

export const API_PREFIX = 'api';

/**
 * Application-wide setup shared by `main.ts` and the e2e tests, so the tests
 * exercise exactly the same pipes, filters and prefix as production.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.setGlobalPrefix(API_PREFIX);
  // The web server calls the API on behalf of browsers and forwards their
  // IP in X-Forwarded-For; trusting it lets rate limits apply per browser
  // instead of to the web container as a whole.
  const trustProxy = config.get('TRUST_PROXY', { infer: true });
  app.set('trust proxy', trustProxy === 'false' ? false : trustProxy);
  // Built-in since Nest 12: the same headers as helmet 8, including a CSP.
  // `upgrade-insecure-requests` is removed because the stack runs on plain
  // HTTP locally, where it would break Swagger UI's requests.
  app.useSecurityHeaders({
    contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  app.enableShutdownHooks();
}
