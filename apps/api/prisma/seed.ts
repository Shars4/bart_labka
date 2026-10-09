/**
 * Idempotent seed, safe to run on every container start:
 * - the bootstrap admin is created, or updated from the env variables;
 * - an optional demo user (DEMO_USER_*) is created the same way, already
 *   verified, and linked to the demo adoption requests sent from its email;
 * - demo animals are inserted only when the animals table is empty, so
 *   animals an admin deleted do not come back after a restart.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { MAX_PASSWORD_BYTES, hashPassword } from '../src/auth/password.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { demoAnimals } from './seed-data.js';

const MIN_PASSWORD_LENGTH = 8;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function checkPassword(variable: string, password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `${variable} must have at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    throw new Error(`${variable} must not exceed ${MAX_PASSWORD_BYTES} bytes`);
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
});

/**
 * The env variables are the source of truth for seeded accounts, so a
 * changed password takes effect on the next start. Seeded emails count as
 * verified.
 */
async function upsertAccount(account: {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'USER';
}) {
  const email = account.email.toLowerCase();
  const passwordHash = await hashPassword(account.password);
  return prisma.user.upsert({
    where: { email },
    update: { name: account.name, passwordHash, role: account.role },
    create: {
      email,
      name: account.name,
      passwordHash,
      role: account.role,
      emailVerifiedAt: new Date(),
    },
  });
}

async function seedAdmin() {
  const password = requireEnv('ADMIN_PASSWORD');
  checkPassword('ADMIN_PASSWORD', password);
  return upsertAccount({
    email: requireEnv('ADMIN_EMAIL'),
    password,
    name: process.env.ADMIN_NAME?.trim() || 'Správca útulku',
    role: 'ADMIN',
  });
}

/** Skipped unless both DEMO_USER_EMAIL and DEMO_USER_PASSWORD are set. */
async function seedDemoUser() {
  const email = process.env.DEMO_USER_EMAIL?.trim();
  const password = process.env.DEMO_USER_PASSWORD?.trim();
  if (!email || !password) {
    return null;
  }
  checkPassword('DEMO_USER_PASSWORD', password);
  const user = await upsertAccount({
    email,
    password,
    name: process.env.DEMO_USER_NAME?.trim() || 'Jana Nováková',
    role: 'USER',
  });
  await prisma.adoptionRequest.updateMany({
    where: { email: user.email, userId: null },
    data: { userId: user.id },
  });
  return user;
}

async function seedDemoAnimals(adminId: number): Promise<number> {
  return prisma.$transaction(async (tx) => {
    if ((await tx.animal.count()) > 0) {
      return 0;
    }
    for (const animal of demoAnimals) {
      await tx.animal.create({
        data: { ...animal, createdBy: { connect: { id: adminId } } },
      });
    }
    return demoAnimals.length;
  });
}

async function main() {
  const admin = await seedAdmin();
  console.log(`Seed: admin account ready (${admin.email})`);

  const created = await seedDemoAnimals(admin.id);
  console.log(
    created > 0
      ? `Seed: inserted ${created} demo animals with adoption requests`
      : 'Seed: animals already present, demo data skipped',
  );

  // After the animals, so the demo user's requests exist to be linked.
  const demoUser = await seedDemoUser();
  if (demoUser) {
    console.log(`Seed: demo user ready (${demoUser.email})`);
  }
}

try {
  await main();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
