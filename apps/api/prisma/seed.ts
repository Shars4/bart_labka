/**
 * Idempotent seed, safe to run on every container start:
 * - the bootstrap admin is created, or updated from the env variables;
 * - demo animals are inserted only when the animals table is empty, so
 *   animals an admin deleted do not come back after a restart.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { MAX_PASSWORD_BYTES, hashPassword } from '../src/auth/password.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { demoAnimals } from './seed-data.js';

const MIN_ADMIN_PASSWORD_LENGTH = 8;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
});

async function seedAdmin() {
  const email = requireEnv('ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('ADMIN_PASSWORD');
  const name = process.env.ADMIN_NAME?.trim() || 'Správca útulku';

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must have at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`,
    );
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    throw new Error(
      `ADMIN_PASSWORD must not exceed ${MAX_PASSWORD_BYTES} bytes`,
    );
  }

  // The env variables are the source of truth for the bootstrap admin, so a
  // changed ADMIN_PASSWORD takes effect on the next start.
  const passwordHash = await hashPassword(password);
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash, role: 'ADMIN' },
  });
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
}

try {
  await main();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
