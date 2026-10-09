import { execSync } from 'node:child_process';
import { TEST_ENV } from './test-env.js';

/**
 * Runs once before all e2e tests: creates the test database if needed and
 * applies the migrations, exactly as the API container does on start.
 */
export default function setup(): void {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: TEST_ENV.DATABASE_URL },
    stdio: 'inherit',
  });
}
