import { Prisma } from '../generated/prisma/client.js';

/** A unique constraint or unique index rejected the write. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
