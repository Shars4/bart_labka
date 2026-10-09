import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { animalSummarySelect } from '../animals/dto/animal.dto.js';
import { paginationMeta } from '../common/dto/pagination.dto.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import { Prisma } from '../generated/prisma/client.js';
import { AdoptionStatus, AnimalStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  type AdoptionRequestDto,
  type PaginatedAdoptionRequestsDto,
  toAdoptionRequestDto,
} from './dto/adoption-request.dto.js';
import type { AdoptionRequestQueryDto } from './dto/adoption-request-query.dto.js';
import type { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto.js';
import type { UpdateAdoptionRequestDto } from './dto/update-adoption-request.dto.js';

const withAnimal = {
  animal: { select: animalSummarySelect },
} as const satisfies Prisma.AdoptionRequestInclude;

@Injectable()
export class AdoptionRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: anyone can ask to adopt an available animal. One pending request
   * per email and animal is enforced by a partial unique index.
   */
  async create(
    animalId: number,
    dto: CreateAdoptionRequestDto,
  ): Promise<AdoptionRequestDto> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      select: { status: true },
    });
    if (!animal) {
      throw new NotFoundException(`Zviera s ID ${animalId} neexistuje.`);
    }
    if (animal.status !== AnimalStatus.AVAILABLE) {
      throw new ConflictException({
        code: ErrorCode.AnimalNotAvailable,
        message: 'Toto zviera už nie je dostupné na adopciu.',
      });
    }

    try {
      const request = await this.prisma.adoptionRequest.create({
        data: { ...dto, animalId },
        include: withAnimal,
      });
      return toAdoptionRequestDto(request);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException({
          code: ErrorCode.DuplicateAdoptionRequest,
          message:
            'Žiadosť o toto zviera z tohto emailu už evidujeme. Ozveme sa vám čo najskôr.',
        });
      }
      throw error;
    }
  }

  async findMany(
    query: AdoptionRequestQueryDto,
  ): Promise<PaginatedAdoptionRequestsDto> {
    const { page = 1, pageSize = 12, status, animalId } = query;
    const where: Prisma.AdoptionRequestWhereInput = { status, animalId };

    const [total, requests] = await this.prisma.$transaction([
      this.prisma.adoptionRequest.count({ where }),
      this.prisma.adoptionRequest.findMany({
        where,
        include: withAnimal,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: requests.map(toAdoptionRequestDto),
      meta: paginationMeta(page, pageSize, total),
    };
  }

  async findOne(id: number): Promise<AdoptionRequestDto> {
    const request = await this.prisma.adoptionRequest.findUnique({
      where: { id },
      include: withAnimal,
    });
    if (!request) {
      throw requestNotFound(id);
    }
    return toAdoptionRequestDto(request);
  }

  /**
   * Approves or rejects a pending request. Approving marks the animal as
   * adopted and rejects its other pending requests, all in one transaction.
   *
   * Updates are conditional (WHERE status = ...), so a concurrent change by
   * another admin makes them match nothing and the transaction rolls back.
   * The animal row is updated first, so two approvals for the same animal
   * queue up on its row lock instead of deadlocking.
   */
  async resolve(
    id: number,
    { status }: UpdateAdoptionRequestDto,
  ): Promise<AdoptionRequestDto> {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.adoptionRequest.findUnique({
        where: { id },
        select: { animalId: true },
      });
      if (!request) {
        throw requestNotFound(id);
      }

      if (status === AdoptionStatus.APPROVED) {
        const adopted = await tx.animal.updateMany({
          where: {
            id: request.animalId,
            status: { not: AnimalStatus.ADOPTED },
          },
          data: { status: AnimalStatus.ADOPTED },
        });
        if (adopted.count === 0) {
          throw new ConflictException({
            code: ErrorCode.AnimalNotAvailable,
            message:
              'Zviera už bolo adoptované, žiadosť nie je možné schváliť.',
          });
        }
      }

      const resolved = await tx.adoptionRequest.updateMany({
        where: { id, status: AdoptionStatus.PENDING },
        data: { status },
      });
      if (resolved.count === 0) {
        throw new ConflictException({
          code: ErrorCode.AdoptionRequestAlreadyResolved,
          message: 'Žiadosť už bola vybavená a nedá sa zmeniť.',
        });
      }

      if (status === AdoptionStatus.APPROVED) {
        await tx.adoptionRequest.updateMany({
          where: { animalId: request.animalId, status: AdoptionStatus.PENDING },
          data: { status: AdoptionStatus.REJECTED },
        });
      }

      return toAdoptionRequestDto(
        await tx.adoptionRequest.findUniqueOrThrow({
          where: { id },
          include: withAnimal,
        }),
      );
    });
  }

  async remove(id: number): Promise<void> {
    const { count } = await this.prisma.adoptionRequest.deleteMany({
      where: { id },
    });
    if (count === 0) {
      throw requestNotFound(id);
    }
  }
}

function requestNotFound(id: number): NotFoundException {
  return new NotFoundException(`Žiadosť s ID ${id} neexistuje.`);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
