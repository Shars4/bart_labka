import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/transforms.js';

export class VerifyEmailDto {
  /** Token from the link in the verification email. */
  @IsString({ message: 'Overovací kód musí byť text.' })
  @IsNotEmpty({ message: 'Chýba overovací kód.' })
  @MaxLength(2000, { message: 'Overovací kód je príliš dlhý.' })
  token: string;
}

export class ResendVerificationDto {
  /** @example jana.novakova@example.com */
  @NormalizeEmail()
  @IsString({ message: 'Email musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte email.' })
  @IsEmail({}, { message: 'Zadajte platnú emailovú adresu.' })
  @MaxLength(254, { message: 'Email môže mať najviac 254 znakov.' })
  email: string;
}
