import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/transforms.js';

export class LoginDto {
  /** @example admin@utulok.local */
  @NormalizeEmail()
  @IsString({ message: 'Email musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte email.' })
  @IsEmail({}, { message: 'Zadajte platnú emailovú adresu.' })
  @MaxLength(254, { message: 'Email môže mať najviac 254 znakov.' })
  email: string;

  /** @example Admin123! */
  @IsString({ message: 'Heslo musí byť text.' })
  @IsNotEmpty({ message: 'Zadajte heslo.' })
  @MaxLength(128, { message: 'Heslo môže mať najviac 128 znakov.' })
  password: string;
}
