import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';
import { AdoptionStatus } from '../../generated/prisma/enums.js';

/** Newest requests come first. */
export class AdoptionRequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AdoptionStatus, enumName: 'AdoptionStatus' })
  @IsOptional()
  @IsEnum(AdoptionStatus, { message: 'Neznámy stav žiadosti.' })
  status?: AdoptionStatus;

  /** Only requests for this animal. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID zvieraťa musí byť celé číslo.' })
  @Min(1, { message: 'ID zvieraťa musí byť kladné číslo.' })
  animalId?: number;
}
