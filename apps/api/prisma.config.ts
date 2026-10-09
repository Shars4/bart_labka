// Loads apps/api/.env for local development; inside Docker the variables
// come from docker-compose.yml and no .env file exists.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Plain process.env instead of Prisma's env() helper: `prisma generate`
    // runs during the Docker build where no database URL exists, and env()
    // would throw there.
    url: process.env.DATABASE_URL,
  },
});
