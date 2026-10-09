import { Injectable, NotFoundException } from '@nestjs/common';
import { fromDateOnly, toDateOnly, todayInShelter } from '../common/dates.js';
import { paginationMeta } from '../common/dto/pagination.dto.js';
import { fieldValidationError } from '../common/validation/field-validation-error.js';
import type { Animal, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  type AnimalDto,
  type PaginatedAnimalsDto,
  toAnimalDto,
} from './dto/animal.dto.js';
import { type AnimalQueryDto, AnimalSort } from './dto/animal-query.dto.js';
import type { CreateAnimalDto } from './dto/create-animal.dto.js';
import type { UpdateAnimalDto } from './dto/update-animal.dto.js';

// The id tie-breaker keeps pagination stable when sort values are equal.
const ORDER_BY: Record<AnimalSort, Prisma.AnimalOrderByWithRelationInput[]> = {
  [AnimalSort.Newest]: [{ intakeDate: 'desc' }, { id: 'desc' }],
  [AnimalSort.Oldest]: [{ intakeDate: 'asc' }, { id: 'asc' }],
  [AnimalSort.Name]: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: AnimalQueryDto): Promise<PaginatedAnimalsDto> {
    const {
      page = 1,
      pageSize = 12,
      sort = AnimalSort.Newest,
      q,
      ...filters
    } = query;

    const where: Prisma.AnimalWhereInput = {
      species: filters.species,
      sex: filters.sex,
      size: filters.size,
      status: filters.status,
      ...(q && { id: { in: await this.searchIds(q) } }),
    };

    const [total, animals] = await this.prisma.$transaction([
      this.prisma.animal.count({ where }),
      this.prisma.animal.findMany({
        where,
        orderBy: ORDER_BY[sort],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: animals.map(toAnimalDto),
      meta: paginationMeta(page, pageSize, total),
    };
  }

  async findOne(id: number): Promise<AnimalDto> {
    return toAnimalDto(await this.findEntity(id));
  }

  async create(dto: CreateAnimalDto, createdById: number): Promise<AnimalDto> {
    const intakeDate = dto.intakeDate ?? todayInShelter();
    assertBornBeforeIntake(dto.birthDate, intakeDate);

    const animal = await this.prisma.animal.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? fromDateOnly(dto.birthDate) : null,
        intakeDate: fromDateOnly(intakeDate),
        createdById,
      },
    });
    return toAnimalDto(animal);
  }

  async update(id: number, dto: UpdateAnimalDto): Promise<AnimalDto> {
    const existing = await this.findEntity(id);
    assertBornBeforeIntake(
      dto.birthDate === undefined
        ? existing.birthDate && toDateOnly(existing.birthDate)
        : dto.birthDate,
      dto.intakeDate ?? toDateOnly(existing.intakeDate),
    );

    const animal = await this.prisma.animal.update({
      where: { id },
      data: {
        ...dto,
        birthDate:
          dto.birthDate === undefined
            ? undefined
            : dto.birthDate && fromDateOnly(dto.birthDate),
        intakeDate: dto.intakeDate && fromDateOnly(dto.intakeDate),
      },
    });
    return toAnimalDto(animal);
  }

  /** Also deletes the animal's adoption requests (ON DELETE CASCADE). */
  async remove(id: number): Promise<void> {
    const { count } = await this.prisma.animal.deleteMany({ where: { id } });
    if (count === 0) {
      throw animalNotFound(id);
    }
  }

  /**
   * Ids of animals whose name or breed contains the text, ignoring case and
   * diacritics ("tigrik" finds "Tigrík"). Prisma's filters cannot call
   * unaccent(), so this one condition is raw (parameterized) SQL.
   */
  private async searchIds(text: string): Promise<number[]> {
    const pattern = `%${escapeLikePattern(text)}%`;
    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM animals
      WHERE unaccent(name) ILIKE unaccent(${pattern})
         OR unaccent(coalesce(breed, '')) ILIKE unaccent(${pattern})`;
    return rows.map((row) => row.id);
  }

  private async findEntity(id: number): Promise<Animal> {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw animalNotFound(id);
    }
    return animal;
  }
}

/** Makes %, _ and \ in user input match literally in a LIKE pattern. */
function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function animalNotFound(id: number): NotFoundException {
  return new NotFoundException(`Zviera s ID ${id} neexistuje.`);
}

/** Mirrors the animals_birth_before_intake_check constraint. */
function assertBornBeforeIntake(
  birthDate: string | null | undefined,
  intakeDate: string,
): void {
  if (birthDate && birthDate > intakeDate) {
    throw fieldValidationError(
      'birthDate',
      'Dátum narodenia nemôže byť neskôr ako dátum príjmu.',
    );
  }
}
