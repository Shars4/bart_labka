import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { IsOptionalNonNull } from '../validation/validators.js';

export const MAX_PAGE_SIZE = 50;

/** Query parameters shared by every paginated list endpoint. */
export class PaginationQueryDto {
  /**
   * Page number, starting at 1.
   * @example 1
   */
  @IsOptionalNonNull()
  @Type(() => Number)
  @IsInt({ message: 'Číslo stránky musí byť celé číslo.' })
  @Min(1, { message: 'Číslo stránky musí byť aspoň 1.' })
  page?: number = 1;

  /**
   * Items per page.
   * @example 12
   */
  @IsOptionalNonNull()
  @Type(() => Number)
  @IsInt({ message: 'Počet položiek na stránku musí byť celé číslo.' })
  @Min(1, { message: 'Počet položiek na stránku musí byť aspoň 1.' })
  @Max(MAX_PAGE_SIZE, {
    message: `Počet položiek na stránku môže byť najviac ${MAX_PAGE_SIZE}.`,
  })
  pageSize?: number = 12;
}

export class PaginationMetaDto {
  /** @example 1 */
  page: number;

  /** @example 12 */
  pageSize: number;

  /**
   * Number of items matching the filters, across all pages.
   * @example 8
   */
  total: number;

  /** @example 1 */
  totalPages: number;
}

export function paginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMetaDto {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
