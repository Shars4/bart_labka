import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdoptionRequestsModule } from './adoption-requests/adoption-requests.module.js';
import { AnimalsModule } from './animals/animals.module.js';
import { AuthGuard } from './auth/auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { throttlerOptionsFactory } from './common/throttling/rate-limit.js';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { MailModule } from './mail/mail.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StatsModule } from './stats/stats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: throttlerOptionsFactory,
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    HealthModule,
    AnimalsModule,
    AdoptionRequestsModule,
    StatsModule,
  ],
  providers: [
    // Global guards run in this order: rate limiting first, so blocked
    // clients never reach token verification.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: AuthGuard },
  ],
})
export class AppModule {}
