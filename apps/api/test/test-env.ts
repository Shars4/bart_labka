/**
 * Environment of the e2e tests. The database comes from TEST_DATABASE_URL,
 * never from DATABASE_URL, so the tests cannot wipe the development data by
 * accident; by default it is `shelter_test` in the docker compose Postgres.
 */
const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://shelter:shelter_dev_password@127.0.0.1:5433/shelter_test?schema=public';

const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.includes('test')) {
  throw new Error(
    `Refusing to run e2e tests against "${databaseName}": the tests delete all data, so the database name must contain "test".`,
  );
}

export const TEST_ENV = {
  NODE_ENV: 'test',
  DATABASE_URL: databaseUrl,
  JWT_SECRET: 'test-only-jwt-secret-0123456789abcdef',
  JWT_EXPIRES_IN_SECONDS: '3600',
  // High enough that only the rate-limit spec (which lowers it) hits it.
  RATE_LIMIT_MAX_REQUESTS: '1000',
  RATE_LIMIT_WINDOW_SECONDS: '60',
} as const;
