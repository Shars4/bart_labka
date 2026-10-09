import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '../errors/error-codes.js';

/**
 * A validation error for one field, raised outside class-validator (e.g. a
 * rule that needs data from the database). Same shape as DTO validation
 * errors, so the client handles both alike.
 */
export function fieldValidationError(
  field: string,
  message: string,
): BadRequestException {
  return new BadRequestException({
    code: ErrorCode.ValidationError,
    message: 'Niektoré polia nie sú vyplnené správne.',
    details: [{ field, message }],
  });
}
