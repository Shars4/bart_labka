import {
  type TestContext,
  createAdoptionRequest,
  createAnimal,
  createTestApp,
  loginAsAdmin,
  resetDatabase,
} from './helpers.js';

describe('GET /api/stats', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
    await resetDatabase(context.prisma);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('counts animals and adoption requests by status', async () => {
    const available = await createAnimal(context.prisma);
    await createAnimal(context.prisma, { status: 'RESERVED' });
    await createAnimal(context.prisma, { status: 'ADOPTED' });
    await createAnimal(context.prisma, { status: 'ADOPTED' });
    await createAdoptionRequest(context.prisma, available.id);
    await createAdoptionRequest(context.prisma, available.id, {
      email: 'b@example.com',
      status: 'REJECTED',
    });

    const token = await loginAsAdmin(context);
    const response = await context
      .http()
      .get('/api/stats')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toEqual({
      animals: { total: 4, available: 1, reserved: 1, adopted: 2 },
      adoptionRequests: { total: 2, pending: 1, approved: 0, rejected: 1 },
    });
  });
});
