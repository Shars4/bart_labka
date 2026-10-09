import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { hashPassword } from '../src/auth/password.js';
import type { Prisma } from '../src/generated/prisma/client.js';
import {
  MAIL_TRANSPORT,
  type MailMessage,
  type MailTransport,
} from '../src/mail/mail-transport.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

export const ADMIN = {
  email: 'admin@test.local',
  password: 'Test-Admin-Password-1',
} as const;

export interface TestContext {
  app: NestExpressApplication;
  prisma: PrismaService;
  http: () => ReturnType<typeof request>;
  /** Emails the app sent; tests empty it with `outbox.length = 0`. */
  outbox: MailMessage[];
}

/**
 * The real application module with the same setup as main.ts. Only the SMTP
 * transport is replaced: emails are collected in `outbox`.
 */
export async function createTestApp(): Promise<TestContext> {
  const outbox: MailMessage[] = [];
  const transport: MailTransport = {
    send: (message) => {
      outbox.push(message);
      return Promise.resolve();
    },
  };
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MAIL_TRANSPORT)
    .useValue(transport)
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
    http: () => request(app.getHttpServer()),
    outbox,
  };
}

// bcrypt is deliberately slow, so the admin hash is computed once per file.
let adminPasswordHash: Promise<string> | undefined;

/** Empties all tables and creates the admin account. */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  adminPasswordHash ??= hashPassword(ADMIN.password);
  await prisma.$executeRaw`TRUNCATE adoption_requests, animals, users RESTART IDENTITY CASCADE`;
  await prisma.user.create({
    data: {
      email: ADMIN.email,
      name: 'Test Admin',
      passwordHash: await adminPasswordHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });
}

export async function loginAsAdmin(context: TestContext): Promise<string> {
  return login(context, ADMIN);
}

export async function login(
  context: TestContext,
  credentials: { email: string; password: string },
): Promise<string> {
  const response = await context
    .http()
    .post('/api/auth/login')
    .send(credentials)
    .expect(200);
  return (response.body as { accessToken: string }).accessToken;
}

export const USER = {
  email: 'user@test.local',
  password: 'Test-User-Password-1',
} as const;

let userPasswordHash: Promise<string> | undefined;

/** An ordinary account (role USER), verified unless `verified: false`. */
export async function createUser(
  prisma: PrismaService,
  {
    email = USER.email,
    name = 'Test Používateľ',
    verified = true,
  }: { email?: string; name?: string; verified?: boolean } = {},
) {
  userPasswordHash ??= hashPassword(USER.password);
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await userPasswordHash,
      role: 'USER',
      emailVerifiedAt: verified ? new Date() : null,
    },
  });
}

export function createAnimal(
  prisma: PrismaService,
  data: Partial<Prisma.AnimalUncheckedCreateInput> = {},
) {
  return prisma.animal.create({
    data: {
      name: 'Testovací pes',
      species: 'DOG',
      sex: 'MALE',
      size: 'MEDIUM',
      description: 'Pokojný pes, ktorý slúži na testovanie API.',
      intakeDate: new Date('2026-01-15'),
      ...data,
    },
  });
}

export function createAdoptionRequest(
  prisma: PrismaService,
  animalId: number,
  data: Partial<Prisma.AdoptionRequestUncheckedCreateInput> = {},
) {
  return prisma.adoptionRequest.create({
    data: {
      animalId,
      fullName: 'Jana Testová',
      email: 'jana@example.com',
      message: 'Radi by sme si zviera adoptovali.',
      ...data,
    },
  });
}

/** Asserts the unified ErrorResponseDto shape and the error code. */
export function expectError(
  response: Response,
  status: number,
  code: string,
): void {
  expect(response.status).toBe(status);
  expect(response.body).toMatchObject({
    statusCode: status,
    error: code,
    message: expect.any(String),
    path: expect.stringMatching(/^\/api\//),
    timestamp: expect.any(String),
  });
}

/** Field names reported in `details` of a validation error. */
export function invalidFields(response: Response): string[] {
  const body = response.body as { details?: { field: string }[] };
  return (body.details ?? []).map((detail) => detail.field).sort();
}
