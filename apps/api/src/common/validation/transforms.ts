import { Transform } from 'class-transformer';

/** Trims surrounding whitespace from string input; other values pass through. */
export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

/**
 * Trims string input and turns an empty string into `null`, so clearing an
 * optional text field in a form removes the value instead of storing "".
 */
export function TrimToNull(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
}

/**
 * Trims and lowercases an email. Emails are stored lowercase (enforced by a
 * CHECK constraint), so lookups and duplicate checks are case-insensitive.
 */
export function NormalizeEmail(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}
