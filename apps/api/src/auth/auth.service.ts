import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '../common/errors/error-codes.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from './auth-user.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto } from './dto/login-response.dto.js';
import { type UserDto, toUserDto } from './dto/user.dto.js';
import { hashPassword, verifyPassword } from './password.js';

@Injectable()
export class AuthService {
  /**
   * Compared against when the email is unknown, so the response takes as
   * long as for a wrong password and does not reveal which emails exist.
   */
  private readonly dummyPasswordHash = hashPassword(randomUUID());

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ?? (await this.dummyPasswordHash),
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException({
        code: ErrorCode.InvalidCredentials,
        message: 'Nesprávny email alebo heslo.',
      });
    }

    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }),
      user: toUserDto(user),
    };
  }

  /**
   * Loads the current user from the database. Tokens are stateless, so this
   * is where a deleted account is noticed before its token expires.
   */
  async getProfile(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException(
        'Používateľský účet už neexistuje. Prihláste sa znova.',
      );
    }
    return toUserDto(user);
  }
}
