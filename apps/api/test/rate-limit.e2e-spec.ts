import type { TestContext } from './helpers.js';

// A low limit for this file only. It must be set before the app module is
// imported, because ConfigModule reads the environment at import time.
process.env.RATE_LIMIT_MAX_REQUESTS = '3';
const { createTestApp, expectError, resetDatabase } =
  await import('./helpers.js');

describe('Rate limiting of sensitive routes', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
    await resetDatabase(context.prisma);
  });

  afterAll(async () => {
    await context.app.close();
  });

  const attemptLogin = (clientIp: string, email: string) =>
    context
      .http()
      .post('/api/auth/login')
      .set('X-Forwarded-For', clientIp)
      .send({ email, password: 'wrong-password' });

  it('blocks a client after too many login attempts', async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const email = `user${attempt}@test.local`;
      expect((await attemptLogin('203.0.113.10', email)).status).toBe(401);
    }

    const blocked = await attemptLogin('203.0.113.10', 'user9@test.local');

    expectError(blocked, 429, 'TOO_MANY_REQUESTS');
    expect(blocked.headers['retry-after-ip']).toBeDefined();
  });

  it('counts each client separately (behind the web proxy)', async () => {
    const response = await attemptLogin('203.0.113.11', 'other@test.local');
    expect(response.status).toBe(401);
  });

  it('blocks guessing one account from many IPs', async () => {
    // A forged X-Forwarded-For gives every attempt a new IP; the account
    // limit counts them together anyway, also across letter case.
    for (let attempt = 0; attempt < 3; attempt++) {
      const ip = `198.51.100.${attempt + 1}`;
      const email = attempt === 1 ? ' Target@Test.local' : 'target@test.local';
      expect((await attemptLogin(ip, email)).status).toBe(401);
    }

    const blocked = await attemptLogin('198.51.100.99', 'target@test.local');

    expectError(blocked, 429, 'TOO_MANY_REQUESTS');
    expect(blocked.headers['retry-after-account']).toBeDefined();
  });

  it('does not limit ordinary routes', async () => {
    for (let request = 0; request < 5; request++) {
      await context.http().get('/api/animals').expect(200);
    }
  });
});
