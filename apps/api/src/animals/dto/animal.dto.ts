import { ApiProperty } from '@nestjs/swagger';
import { toDateOnly } from '../../common/dates.js';
import { PaginationMetaDto } from '../../common/dto/pagination.dto.js';
import type { Animal, Prisma } from '../../generated/prisma/client.js';
import {
  AnimalStatus,
  Sex,
  Size,
  Species,
} from '../../generated/prisma/enums.js';

export class AnimalDto {
  /** @example 1 */
  id: number;

  /** @example Bella */
  name: string;

  @ApiProperty({ enum: Species, enumName: 'Species' })
  species: Species;

  /** @example Labradorský retriever */
  breed: string | null;

  @ApiProperty({ enum: Sex, enumName: 'Sex' })
  sex: Sex;

  @ApiProperty({ enum: Size, enumName: 'Size' })
  size: Size;

  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    example: '2022-04-12',
  })
  birthDate: string | null;

  @ApiProperty({ type: String, format: 'date', example: '2026-02-03' })
  intakeDate: string;

  /** @example Bella je priateľská a hravá sučka, ktorá miluje vodu. */
  description: string;

  /**
   * Absolute URL, or a path to an image served by the web app.
   * @example /images/animals/bella.jpg
   */
  imageUrl: string | null;

  isVaccinated: boolean;

  isNeutered: boolean;

  @ApiProperty({ enum: AnimalStatus, enumName: 'AnimalStatus' })
  status: AnimalStatus;

  createdAt: Date;

  updatedAt: Date;
}

/** Short form embedded in other resources, e.g. adoption requests. */
export class AnimalSummaryDto {
  /** @example 1 */
  id: number;

  /** @example Bella */
  name: string;

  @ApiProperty({ enum: Species, enumName: 'Species' })
  species: Species;

  @ApiProperty({ enum: AnimalStatus, enumName: 'AnimalStatus' })
  status: AnimalStatus;

  /** @example /images/animals/bella.jpg */
  imageUrl: string | null;
}

export class PaginatedAnimalsDto {
  data: AnimalDto[];

  meta: PaginationMetaDto;
}

/** Explicit mapping keeps internal columns (createdById) out of responses. */
export function toAnimalDto(animal: Animal): AnimalDto {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    sex: animal.sex,
    size: animal.size,
    birthDate: animal.birthDate ? toDateOnly(animal.birthDate) : null,
    intakeDate: toDateOnly(animal.intakeDate),
    description: animal.description,
    imageUrl: animal.imageUrl,
    isVaccinated: animal.isVaccinated,
    isNeutered: animal.isNeutered,
    status: animal.status,
    createdAt: animal.createdAt,
    updatedAt: animal.updatedAt,
  };
}

export const animalSummarySelect = {
  id: true,
  name: true,
  species: true,
  status: true,
  imageUrl: true,
} as const satisfies Prisma.AnimalSelect;
