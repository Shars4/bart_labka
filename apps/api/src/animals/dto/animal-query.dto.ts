import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';
import { TrimToNull } from '../../common/validation/transforms.js';
import {
  AnimalStatus,
  Sex,
  Size,
  Species,
} from '../../generated/prisma/enums.js';

export const AnimalSort = {
  /** Most recently admitted first. */
  Newest: 'newest',
  Oldest: 'oldest',
  Name: 'name',
} as const;
export type AnimalSort = (typeof AnimalSort)[keyof typeof AnimalSort];

export class AnimalQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Species, enumName: 'Species' })
  @IsOptional()
  @IsEnum(Species, { message: 'Neznámy druh zvieraťa.' })
  species?: Species;

  @ApiPropertyOptional({ enum: Sex, enumName: 'Sex' })
  @IsOptional()
  @IsEnum(Sex, { message: 'Neznáme pohlavie.' })
  sex?: Sex;

  @ApiPropertyOptional({ enum: Size, enumName: 'Size' })
  @IsOptional()
  @IsEnum(Size, { message: 'Neznáma veľkosť.' })
  size?: Size;

  @ApiPropertyOptional({ enum: AnimalStatus, enumName: 'AnimalStatus' })
  @IsOptional()
  @IsEnum(AnimalStatus, { message: 'Neznámy stav.' })
  status?: AnimalStatus;

  /**
   * Case-insensitive search in name and breed.
   * @example retriever
   */
  @IsOptional()
  @TrimToNull()
  @IsString({ message: 'Hľadaný výraz musí byť text.' })
  @MaxLength(100, { message: 'Hľadaný výraz môže mať najviac 100 znakov.' })
  q?: string | null;

  @ApiPropertyOptional({
    enum: AnimalSort,
    enumName: 'AnimalSort',
    default: AnimalSort.Newest,
  })
  @IsOptional()
  @IsEnum(AnimalSort, { message: 'Neznámy spôsob zoradenia.' })
  sort?: AnimalSort = AnimalSort.Newest;
}
