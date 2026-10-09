import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetailDto {
  /** Path of the invalid field; nested fields use dot notation. */
  @ApiProperty({ example: 'name' })
  field: string;

  @ApiProperty({ example: 'Meno musí mať 2 až 50 znakov.' })
  message: string;
}

/** Shape of every error response returned by the API. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  /** Machine-readable error code, e.g. VALIDATION_ERROR or NOT_FOUND. */
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  error: string;

  /** Human-readable message in Slovak, safe to show to end users. */
  @ApiProperty({ example: 'Niektoré polia nie sú vyplnené správne.' })
  message: string;

  /** Field-level problems; present only for validation errors. */
  @ApiPropertyOptional({ type: [ErrorDetailDto] })
  details?: ErrorDetailDto[];

  @ApiProperty({ example: '/api/animals' })
  path: string;

  @ApiProperty({ example: '2026-10-09T10:00:00.000Z' })
  timestamp: string;
}
