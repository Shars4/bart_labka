import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '../common/errors/error-codes.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import type { User } from '../generated/prisma/client.js';
import { MailService } from '../mail/mail.service.js';
import { isUniqueViolation } from '../prisma/prisma-errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from './auth-user.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto } from './dto/login-response.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { type UserDto, toUserDto } from './dto/user.dto.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  EMAIL_VERIFICATION_AUDIENCE,
  EMAIL_VERIFICATION_TTL_SECONDS,
  type EmailVerificationPayload,
} from './tokens.js';

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
    private readonly mail: MailService,
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
    // Checked only after the password, so it reveals nothing to strangers.
    if (user.emailVerifiedAt === null) {
      throw new ForbiddenException({
        code: ErrorCode.EmailNotVerified,
        message:
          'Email ešte nie je overený. Otvorte odkaz z overovacieho emailu, alebo si ho nechajte poslať znova.',
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

  /** Creates an unverified user account and emails the verification link. */
  async register({ name, email, password }: RegisterDto): Promise<UserDto> {
    let user: User;
    try {
      user = await this.prisma.user.create({
        data: { name, email, passwordHash: await hashPassword(password) },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException({
          code: ErrorCode.EmailTaken,
          message:
            'Účet s týmto emailom už existuje. Prihláste sa, prípadne si nechajte znova poslať overovací email.',
        });
      }
      throw error;
    }

    await this.sendVerificationEmail(user);
    return toUserDto(user);
  }

  /**
   * Marks the email as verified. Idempotent: opening the link again (or an
   * email scanner opening it first) changes nothing.
   */
  async verifyEmail(token: string): Promise<UserDto> {
    const payload = await this.jwt
      .verifyAsync<EmailVerificationPayload>(token, {
        audience: EMAIL_VERIFICATION_AUDIENCE,
      })
      .catch(() => null);
    const user = payload
      ? await this.prisma.user.findUnique({
          where: { id: Number(payload.sub) },
        })
      : null;
    if (!payload || !user || user.email !== payload.email) {
      throw new BadRequestException({
        code: ErrorCode.InvalidVerificationToken,
        message:
          'Odkaz na overenie je neplatný alebo mu vypršala platnosť. Nechajte si poslať nový.',
      });
    }

    if (user.emailVerifiedAt !== null) {
      return toUserDto(user);
    }
    return toUserDto(
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
    );
  }

  /**
   * Sends a new verification link if the account exists and is not verified
   * yet. The caller always gets the same answer, so it cannot be used to
   * find out which emails have an account.
   */
  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.emailVerifiedAt === null) {
      await this.sendVerificationEmail(user);
    }
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

  private async sendVerificationEmail(user: User): Promise<void> {
    const payload: EmailVerificationPayload = {
      sub: String(user.id),
      email: user.email,
    };
    const token = await this.jwt.signAsync(payload, {
      audience: EMAIL_VERIFICATION_AUDIENCE,
      expiresIn: EMAIL_VERIFICATION_TTL_SECONDS,
    });
    await this.mail.sendEmailVerification(user, token);
  }
}
