import { BadRequestException, type ValidationError } from '@nestjs/common';
import type { ErrorDetailDto } from '../dto/error-response.dto.js';
import { ErrorCode } from '../errors/error-codes.js';

/**
 * Order in which failed constraints of one field are reported (lower
 * first): a missing value before a wrong type, a wrong type before format or
 * range problems. class-validator runs decorators bottom-up, so relying on
 * its order would force DTOs to list decorators in reverse.
 */
const CONSTRAINT_PRIORITY: Record<string, number> = {
  whitelistValidation: 0,
  isDefined: 1,
  isNotEmpty: 1,
  isString: 2,
  isInt: 2,
  isNumber: 2,
  isBoolean: 2,
  isEnum: 2,
  isDateString: 2,
  isArray: 2,
};
const DEFAULT_PRIORITY = 3;

/**
 * Turns class-validator errors into a 400 response with one message per
 * invalid field, so the web client can show it next to the input.
 */
export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    code: ErrorCode.ValidationError,
    message: 'Niektoré polia nie sú vyplnené správne.',
    details: flattenValidationErrors(errors),
  });
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ErrorDetailDto[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const ownDetail = mostRelevantConstraint(error.constraints);

    return [
      ...(ownDetail ? [{ field, message: messageFor(ownDetail, field) }] : []),
      ...flattenValidationErrors(error.children ?? [], field),
    ];
  });
}

function mostRelevantConstraint(
  constraints: Record<string, string> | undefined,
): [constraint: string, message: string] | undefined {
  const priority = (name: string) =>
    CONSTRAINT_PRIORITY[name] ?? DEFAULT_PRIORITY;
  return Object.entries(constraints ?? {}).sort(
    ([a], [b]) => priority(a) - priority(b),
  )[0];
}

function messageFor([constraint, message]: [string, string], field: string) {
  // class-validator's built-in whitelist message is English-only.
  return constraint === 'whitelistValidation'
    ? `Pole „${field}“ nie je povolené.`
    : message;
}
