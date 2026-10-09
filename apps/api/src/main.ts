import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { API_PREFIX, configureApp } from './app.setup.js';
import type { EnvironmentVariables } from './config/env.validation.js';
import { DOCS_PATH, setupSwagger } from './swagger.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  setupSwagger(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API:     http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Swagger: http://localhost:${port}/${DOCS_PATH}`);
}

await bootstrap();
