import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  NormalizeEmail,
  Trim,
  TrimToNull,
} from '../../common/validation/transforms.js';

export class CreateAdoptionRequestDto {
  /** @example Jana Nováková */
  @Trim()
  @IsString({ message: 'Meno musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte meno a priezvisko.' })
  @Length(2, 100, { message: 'Meno musí mať 2 až 100 znakov.' })
  fullName: string;

  /** @example jana.novakova@example.com */
  @NormalizeEmail()
  @IsString({ message: 'Email musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte email.' })
  @IsEmail({}, { message: 'Zadajte platnú emailovú adresu.' })
  @MaxLength(254, { message: 'Email môže mať najviac 254 znakov.' })
  email: string;

  /** @example +421 905 123 456 */
  @IsOptional()
  @TrimToNull()
  @IsString({ message: 'Telefón musí byť text.' })
  @Matches(/^\+?[0-9 ]{9,19}$/, {
    message: 'Zadajte platné telefónne číslo, napr. +421 905 123 456.',
  })
  phone?: string | null;

  /** @example Máme dom so záhradou a radi by sme Bellu spoznali. */
  @Trim()
  @IsString({ message: 'Správa musí byť text.' })
  @IsNotEmpty({ message: 'Napíšte nám pár slov o sebe.' })
  @Length(10, 2000, { message: 'Správa musí mať 10 až 2000 znakov.' })
  message: string;
}
