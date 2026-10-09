import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { animalSummarySelect } from '../animals/dto/animal.dto.js';
import type { AuthUser } from '../auth/auth-user.js';
import type { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { paginationMeta } from '../common/dto/pagination.dto.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  AdoptionStatus,
  AnimalStatus,
  Role,
} from '../generated/prisma/enums.js';
import { MailService } from '../mail/mail.service.js';
import { isUniqueViolation } from '../prisma/prisma-errors.js';
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

/** Who gets the email about a decision. */
interface Applicant {
  fullName: string;
  email: string;
  userId: number | null;
}

@Injectable()
export class AdoptionRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * Public: anyone can ask to adopt an available animal. One pending request
   * per email and animal is enforced by a partial unique index.
   *
   * A signed-in user's request belongs to their account and always uses the
   * account's (verified) email, so it shows up under "Moje žiadosti".
   */
  async create(
    animalId: number,
    dto: CreateAdoptionRequestDto,
    user?: AuthUser,
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

    // The token may outlive a deleted account; then the request is anonymous.
    const account = user
      ? await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true },
        })
      : null;

    let request;
    try {
      request = await this.prisma.adoptionRequest.create({
        data: {
          ...dto,
          animalId,
          ...(account ? { email: account.email, userId: account.id } : {}),
        },
        include: withAnimal,
      });
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

    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true },
    });
    await Promise.all([
      this.mail.sendAdoptionRequestReceived(request),
      this.mail.sendNewAdoptionRequestToAdmins(
        request,
        admins.map((admin) => admin.email),
      ),
    ]);
    return toAdoptionRequestDto(request);
  }

  async findMany(
    query: AdoptionRequestQueryDto,
  ): Promise<PaginatedAdoptionRequestsDto> {
    const { page = 1, pageSize = 12, status, animalId } = query;
    return this.paginate({ status, animalId }, page, pageSize);
  }

  /**
   * The signed-in user's requests: those sent from the account and earlier
   * anonymous ones from the same email. Signing in requires a verified email,
   * so the email match proves they are the user's own.
   */
  async findMine(
    user: AuthUser,
    { page = 1, pageSize = 12 }: PaginationQueryDto,
  ): Promise<PaginatedAdoptionRequestsDto> {
    return this.paginate(
      { OR: [{ userId: user.id }, { email: user.email }] },
      page,
      pageSize,
    );
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
   *
   * After the commit, every applicant whose request was decided gets an email.
   */
  async resolve(
    id: number,
    { status }: UpdateAdoptionRequestDto,
  ): Promise<AdoptionRequestDto> {
    const approved = status === AdoptionStatus.APPROVED;
    const { request, autoRejected } = await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.adoptionRequest.findUnique({
          where: { id },
          select: { animalId: true },
        });
        if (!existing) {
          throw requestNotFound(id);
        }

        if (approved) {
          const adopted = await tx.animal.updateMany({
            where: {
              id: existing.animalId,
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

        // RETURNING gives exactly the rows this statement rejected.
        const autoRejected: Applicant[] = approved
          ? await tx.adoptionRequest.updateManyAndReturn({
              where: {
                animalId: existing.animalId,
                status: AdoptionStatus.PENDING,
              },
              data: { status: AdoptionStatus.REJECTED },
              select: { fullName: true, email: true, userId: true },
            })
          : [];

        const request = await tx.adoptionRequest.findUniqueOrThrow({
          where: { id },
          include: withAnimal,
        });
        return { request, autoRejected };
      },
    );

    await this.notifyApplicants(request.animal, [
      { applicant: request, approved },
      ...autoRejected.map((applicant) => ({ applicant, approved: false })),
    ]);
    return toAdoptionRequestDto(request);
  }

  async remove(id: number): Promise<void> {
    const { count } = await this.prisma.adoptionRequest.deleteMany({
      where: { id },
    });
    if (count === 0) {
      throw requestNotFound(id);
    }
  }

  private async paginate(
    where: Prisma.AdoptionRequestWhereInput,
    page: number,
    pageSize: number,
  ): Promise<PaginatedAdoptionRequestsDto> {
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

  /** Applicants with an account get a link to "Moje žiadosti". */
  private async notifyApplicants(
    animal: { id: number; name: string },
    decisions: { applicant: Applicant; approved: boolean }[],
  ): Promise<void> {
    const accounts = await this.prisma.user.findMany({
      where: {
        email: { in: decisions.map(({ applicant }) => applicant.email) },
        emailVerifiedAt: { not: null },
      },
      select: { email: true },
    });
    const withAccount = new Set(accounts.map((account) => account.email));

    await Promise.all(
      decisions.map(({ applicant, approved }) =>
        this.mail.sendAdoptionRequestResolved(
          { ...applicant, animal },
          approved,
          applicant.userId !== null || withAccount.has(applicant.email),
        ),
      ),
    );
  }
}

function requestNotFound(id: number): NotFoundException {
  return new NotFoundException(`Žiadosť s ID ${id} neexistuje.`);
}
