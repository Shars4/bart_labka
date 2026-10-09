import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { fieldValidationError } from '../validation/field-validation-error.js';

/** Largest value of a PostgreSQL INTEGER (SERIAL) primary key. */
const MAX_ID = 2_147_483_647;

/**
 * Parses a route `:id` into a positive integer that fits the INTEGER key
 * column. Unlike ParseIntPipe it rejects "1.5", "1e3" and out-of-range
 * values, and reports the problem in the shared validation error format.
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > MAX_ID) {
      throw fieldValidationError(
        metadata.data ?? 'id',
        'ID musí byť kladné celé číslo.',
      );
    }
    return id;
  }
}
