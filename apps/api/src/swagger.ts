import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponseDto } from './common/dto/error-response.dto.js';

export const DOCS_PATH = 'docs';

/** Serves Swagger UI at /docs and the raw OpenAPI document at /docs-json. */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Útulok Labka API')
    .setDescription(
      [
        'REST API útulku pre zvieratá.',
        '',
        'Chránené endpointy vyžadujú Bearer JWT z `POST /api/auth/login` (tlačidlo **Authorize**).',
        'Všetky chyby majú jednotný tvar `ErrorResponseDto`.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponseDto],
  });

  SwaggerModule.setup(DOCS_PATH, app, document, {
    jsonDocumentUrl: `${DOCS_PATH}-json`,
    customSiteTitle: 'Útulok Labka – API dokumentácia',
    swaggerOptions: { persistAuthorization: true },
  });
}
