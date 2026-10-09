import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator.js';
import { RateLimited } from '../common/throttling/rate-limit.js';
import type { AuthUser } from './auth-user.js';
import { AuthService } from './auth.service.js';
import { Authenticated, CurrentUser, Public } from './decorators.js';
import {
  ResendVerificationDto,
  VerifyEmailDto,
} from './dto/email-verification.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserDto } from './dto/user.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @RateLimited({ perAccount: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Prihlásenie',
    description:
      'Pre správcov aj používateľov. Vráti JWT pre hlavičku `Authorization: Bearer <token>`. Neoverený email vráti 403 `EMAIL_NOT_VERIFIED`, ale až po správnom hesle. Počet pokusov je obmedzený pre každú IP adresu aj pre každý účet (email).',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.TOO_MANY_REQUESTS,
  )
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  @RateLimited()
  @ApiOperation({
    summary: 'Registrácia používateľa',
    description:
      'Vytvorí účet s rolou USER a pošle overovací email. Prihlásiť sa dá až po overení emailu.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.CONFLICT,
    HttpStatus.TOO_MANY_REQUESTS,
  )
  register(@Body() dto: RegisterDto): Promise<UserDto> {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Overenie emailu',
    description:
      'Token pochádza z odkazu v overovacom emaili a platí 24 hodín. Opakované overenie nič nezmení.',
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST)
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<UserDto> {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @Public()
  @RateLimited({ perAccount: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Nový overovací email',
    description:
      'Odpoveď je vždy 202, aby sa nedalo zistiť, ktoré emaily majú účet. Email príde, len ak účet existuje a ešte nie je overený.',
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS)
  resendVerification(@Body() dto: ResendVerificationDto): Promise<void> {
    return this.authService.resendVerification(dto.email);
  }

  @Get('me')
  @Authenticated()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktuálne prihlásený používateľ' })
  @ApiErrorResponses(HttpStatus.UNAUTHORIZED)
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.authService.getProfile(user.id);
  }
}
