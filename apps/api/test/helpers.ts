import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { hashPassword } from '../src/auth/password.js';
import type { Prisma } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

export const ADMIN = {
  email: 'admin@test.local',
  password: 'Test-Admin-Password-1',
} as const;

export interface TestContext {
  app: NestExpressApplication;
  prisma: PrismaService;
  http: () => ReturnType<typeof request>;
}

/** The real application module with the same setup as main.ts. */
export async function createTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
    http: () => request(app.getHttpServer()),
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
    },
  });
}

export async function loginAsAdmin(context: TestContext): Promise<string> {
  const response = await context
    .http()
    .post('/api/auth/login')
    .send(ADMIN)
    .expect(200);
  return (response.body as { accessToken: string }).accessToken;
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
