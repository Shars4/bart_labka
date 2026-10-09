import { ApiProperty } from '@nestjs/swagger';
import { AnimalSummaryDto } from '../../animals/dto/animal.dto.js';
import { PaginationMetaDto } from '../../common/dto/pagination.dto.js';
import type { AdoptionRequest, Animal } from '../../generated/prisma/client.js';
import { AdoptionStatus } from '../../generated/prisma/enums.js';

export class AdoptionRequestDto {
  /** @example 1 */
  id: number;

  /** @example 1 */
  animalId: number;

  /** @example Jana Nováková */
  fullName: string;

  /** @example jana.novakova@example.com */
  email: string;

  /** @example +421 905 123 456 */
  phone: string | null;

  /** @example Máme dom so záhradou a radi by sme Bellu spoznali. */
  message: string;

  @ApiProperty({ enum: AdoptionStatus, enumName: 'AdoptionStatus' })
  status: AdoptionStatus;

  createdAt: Date;

  updatedAt: Date;

  animal: AnimalSummaryDto;
}

export class PaginatedAdoptionRequestsDto {
  data: AdoptionRequestDto[];

  meta: PaginationMetaDto;
}

type AdoptionRequestWithAnimal = AdoptionRequest & {
  animal: Pick<Animal, keyof AnimalSummaryDto>;
};

export function toAdoptionRequestDto(
  request: AdoptionRequestWithAnimal,
): AdoptionRequestDto {
  return {
    id: request.id,
    animalId: request.animalId,
    fullName: request.fullName,
    email: request.email,
    phone: request.phone,
    message: request.message,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    animal: {
      id: request.animal.id,
      name: request.animal.name,
      species: request.animal.species,
      status: request.animal.status,
      imageUrl: request.animal.imageUrl,
    },
  };
}
