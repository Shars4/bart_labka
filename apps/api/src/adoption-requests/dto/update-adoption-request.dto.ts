import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AdoptionStatus } from '../../generated/prisma/enums.js';

const RESOLUTIONS = [AdoptionStatus.APPROVED, AdoptionStatus.REJECTED] as const;
type Resolution = (typeof RESOLUTIONS)[number];

/** Resolves a pending request; a resolved request cannot be changed again. */
export class UpdateAdoptionRequestDto {
  @ApiProperty({ enum: RESOLUTIONS, example: AdoptionStatus.APPROVED })
  @IsIn(RESOLUTIONS, {
    message: 'Žiadosť môžete iba schváliť alebo zamietnuť.',
  })
  status: Resolution;
}
