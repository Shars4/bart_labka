import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/validation/transforms.js';
import { MaxBytes } from '../../common/validation/validators.js';
import { MAX_PASSWORD_BYTES } from '../password.js';

export const MIN_PASSWORD_LENGTH = 8;

export class RegisterDto {
  /** @example Jana Nováková */
  @Trim()
  @IsString({ message: 'Meno musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte meno a priezvisko.' })
  @Length(2, 100, { message: 'Meno musí mať 2 až 100 znakov.' })
  name: string;

  /** @example jana.novakova@example.com */
  @NormalizeEmail()
  @IsString({ message: 'Email musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte email.' })
  @IsEmail({}, { message: 'Zadajte platnú emailovú adresu.' })
  @MaxLength(254, { message: 'Email môže mať najviac 254 znakov.' })
  email: string;

  /**
   * At least 8 characters and at most 72 bytes (bcrypt ignores the rest).
   * @example Pouzivatel123!
   */
  @IsString({ message: 'Heslo musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte heslo.' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Heslo musí mať aspoň ${MIN_PASSWORD_LENGTH} znakov.`,
  })
  @MaxBytes(MAX_PASSWORD_BYTES, {
    message:
      'Heslo je príliš dlhé (najviac 72 bajtov, s diakritikou menej znakov).',
  })
  password: string;
}
