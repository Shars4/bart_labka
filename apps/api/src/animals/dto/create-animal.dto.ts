import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Trim, TrimToNull } from '../../common/validation/transforms.js';
import {
  IsDateOnly,
  IsImageUrl,
  IsNotInFuture,
  IsOptionalNonNull,
} from '../../common/validation/validators.js';
import {
  AnimalStatus,
  Sex,
  Size,
  Species,
} from '../../generated/prisma/enums.js';

export class CreateAnimalDto {
  /** @example Bella */
  @Trim()
  @IsString({ message: 'Meno musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte meno.' })
  @Length(2, 50, { message: 'Meno musí mať 2 až 50 znakov.' })
  name: string;

  @ApiProperty({ enum: Species, enumName: 'Species' })
  @IsEnum(Species, { message: 'Vyberte druh zvieraťa.' })
  species: Species;

  /** @example Labradorský retriever */
  @IsOptional()
  @TrimToNull()
  @IsString({ message: 'Plemeno musí byť text.' })
  @MaxLength(60, { message: 'Plemeno môže mať najviac 60 znakov.' })
  breed?: string | null;

  @ApiProperty({ enum: Sex, enumName: 'Sex' })
  @IsEnum(Sex, { message: 'Vyberte pohlavie.' })
  sex: Sex;

  @ApiProperty({ enum: Size, enumName: 'Size' })
  @IsEnum(Size, { message: 'Vyberte veľkosť.' })
  size: Size;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    nullable: true,
    example: '2022-04-12',
  })
  @IsOptional()
  @TrimToNull()
  @IsDateOnly({ message: 'Dátum narodenia musí byť platný dátum.' })
  @IsNotInFuture({ message: 'Dátum narodenia nemôže byť v budúcnosti.' })
  birthDate?: string | null;

  /** Defaults to today. */
  @ApiPropertyOptional({ type: String, format: 'date', example: '2026-02-03' })
  @IsOptionalNonNull()
  @IsDateOnly({ message: 'Dátum príjmu musí byť platný dátum.' })
  @IsNotInFuture({ message: 'Dátum príjmu nemôže byť v budúcnosti.' })
  intakeDate?: string;

  /** @example Bella je priateľská a hravá sučka, ktorá miluje vodu a dlhé prechádzky. */
  @Trim()
  @IsString({ message: 'Popis musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte popis.' })
  @Length(20, 2000, { message: 'Popis musí mať 20 až 2000 znakov.' })
  description: string;

  /**
   * Absolute http(s) URL, or a path to an image bundled with the web app.
   * @example /images/animals/bella.jpg
   */
  @IsOptional()
  @TrimToNull()
  @IsString({ message: 'Obrázok musí byť text.' })
  @MaxLength(500, { message: 'Adresa obrázka môže mať najviac 500 znakov.' })
  @IsImageUrl({
    message:
      'Zadajte adresu obrázka začínajúcu na http(s):// alebo cestu /images/….',
  })
  imageUrl?: string | null;

  /** Defaults to false. */
  @IsOptionalNonNull()
  @IsBoolean({ message: 'Očkovanie musí byť áno alebo nie.' })
  isVaccinated?: boolean;

  /** Defaults to false. */
  @IsOptionalNonNull()
  @IsBoolean({ message: 'Kastrácia musí byť áno alebo nie.' })
  isNeutered?: boolean;

  /** Defaults to AVAILABLE. */
  @ApiPropertyOptional({ enum: AnimalStatus, enumName: 'AnimalStatus' })
  @IsOptionalNonNull()
  @IsEnum(AnimalStatus, { message: 'Vyberte stav.' })
  status?: AnimalStatus;
}
