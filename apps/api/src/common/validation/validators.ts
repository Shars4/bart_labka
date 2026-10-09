import {
  ValidateBy,
  ValidateIf,
  type ValidationOptions,
  isURL,
} from 'class-validator';
import { todayInShelter } from '../dates.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Images bundled with the web app (apps/web/public/images). Path segments
 * are restricted, so values like "/images/../x" are rejected.
 */
const BUNDLED_IMAGE_PATH =
  /^\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:jpe?g|png|webp|avif)$/i;

/**
 * Like @IsOptional(), but only for a missing property: an explicit `null`
 * is still validated (and rejected). For fields that may be omitted but
 * whose column is NOT NULL.
 */
export function IsOptionalNonNull(): PropertyDecorator {
  return ValidateIf((_object, value) => value !== undefined);
}

/** A real calendar date in "YYYY-MM-DD" format (rejects e.g. 2026-02-30). */
export function IsDateOnly(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isDateOnly',
      validator: { validate: isDateOnly },
    },
    options,
  );
}

function isDateOnly(value: unknown): boolean {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) {
    return false;
  }
  // Month 13 gives an invalid Date (toISOString would throw); day 30 in
  // February rolls over to March, so the round trip no longer matches.
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** A "YYYY-MM-DD" date that is not after today in the shelter's time zone. */
export function IsNotInFuture(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isNotInFuture',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && value <= todayInShelter(),
      },
    },
    options,
  );
}

/** An absolute http(s) URL or a path to an image bundled with the web app. */
export function IsImageUrl(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isImageUrl',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' &&
          (BUNDLED_IMAGE_PATH.test(value) ||
            isURL(value, {
              protocols: ['http', 'https'],
              require_protocol: true,
            })),
      },
    },
    options,
  );
}
