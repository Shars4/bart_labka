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
import { CurrentUser, Public } from './decorators.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
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
    summary: 'Prihlásenie administrátora',
    description:
      'Vráti JWT pre hlavičku `Authorization: Bearer <token>`. Počet pokusov je obmedzený pre každú IP adresu aj pre každý účet (email).',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.TOO_MANY_REQUESTS,
  )
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktuálne prihlásený používateľ' })
  @ApiErrorResponses(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN)
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.authService.getProfile(user.id);
  }
}
