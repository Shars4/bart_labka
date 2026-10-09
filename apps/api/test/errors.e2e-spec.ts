import {
  type TestContext,
  createTestApp,
  expectError,
  resetDatabase,
} from './helpers.js';

describe('Health check and error format', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
    await resetDatabase(context.prisma);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('reports a healthy service including the database', async () => {
    const response = await context.http().get('/api/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('returns unknown routes as 404 in the unified format', async () => {
    const response = await context.http().get('/api/does-not-exist?x=1');

    expectError(response, 404, 'NOT_FOUND');
    expect(response.body.path).toBe('/api/does-not-exist');
    expect(response.body.message).toBe('Požadovaný zdroj neexistuje.');
  });

  it('rejects malformed JSON with a readable message', async () => {
    const response = await context
      .http()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expectError(response, 400, 'BAD_REQUEST');
    expect(response.body.message).toBe('Telo požiadavky nie je platný JSON.');
  });

  it('protects admin endpoints by default', async () => {
    const response = await context.http().get('/api/stats');

    expectError(response, 401, 'UNAUTHORIZED');
  });

  it('sends security headers', async () => {
    const response = await context.http().get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toContain(
      "default-src 'self'",
    );
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
