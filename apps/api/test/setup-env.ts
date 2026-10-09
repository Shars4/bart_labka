import { TEST_ENV } from './test-env.js';

// Runs in every test file before its imports, so the app's ConfigModule sees
// these values. dotenv does not override variables that are already set,
// which keeps apps/api/.env out of the tests.
Object.assign(process.env, TEST_ENV);
