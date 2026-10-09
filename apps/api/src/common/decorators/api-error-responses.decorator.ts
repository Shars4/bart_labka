import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

const DESCRIPTIONS: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]:
    'Neplatné vstupné údaje. Pri `VALIDATION_ERROR` sú chyby jednotlivých polí v `details`.',
  [HttpStatus.UNAUTHORIZED]: 'Chýba prístupový token alebo je neplatný.',
  [HttpStatus.FORBIDDEN]: 'Používateľ nemá na akciu oprávnenie.',
  [HttpStatus.NOT_FOUND]: 'Požadovaný zdroj neexistuje.',
  [HttpStatus.CONFLICT]: 'Požiadavka je v konflikte s aktuálnym stavom údajov.',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Prekročený limit počtu požiadaviek.',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Služba je dočasne nedostupná.',
};

/**
 * Documents the given error statuses with the shared ErrorResponseDto
 * schema, so controllers don't repeat the same @ApiResponse blocks.
 */
export function ApiErrorResponses(...statuses: HttpStatus[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: DESCRIPTIONS[status],
        type: ErrorResponseDto,
      }),
    ),
  );
}
