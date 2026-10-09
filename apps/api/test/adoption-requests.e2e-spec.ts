import {
  type TestContext,
  createAdoptionRequest,
  createAnimal,
  createTestApp,
  expectError,
  invalidFields,
  loginAsAdmin,
  resetDatabase,
} from './helpers.js';

const validRequest = {
  fullName: 'Ján Novák',
  email: 'jan.novak@example.com',
  phone: '+421 905 123 456',
  message: 'Máme dom so záhradou a radi by sme psíka spoznali.',
};

describe('Adoption requests', () => {
  let context: TestContext;
  let token: string;

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(context.prisma);
    token = await loginAsAdmin(context);
  });

  afterAll(async () => {
    await context.app.close();
  });

  const submit = (animalId: number, body: object = validRequest) =>
    context
      .http()
      .post(`/api/animals/${animalId}/adoption-requests`)
      .send(body);

  const resolve = (requestId: number, status: string) =>
    context
      .http()
      .patch(`/api/adoption-requests/${requestId}`)
      .auth(token, { type: 'bearer' })
      .send({ status });

  describe('POST /api/animals/:animalId/adoption-requests (public)', () => {
    it('creates a pending request without signing in', async () => {
      const animal = await createAnimal(context.prisma, { name: 'Bella' });

      const response = await submit(animal.id, {
        ...validRequest,
        email: '  Jan.Novak@Example.COM ',
      }).expect(201);

      expect(response.headers.location).toBe(
        `/api/adoption-requests/${response.body.id}`,
      );
      expect(response.body).toMatchObject({
        animalId: animal.id,
        email: 'jan.novak@example.com',
        status: 'PENDING',
        animal: { id: animal.id, name: 'Bella', status: 'AVAILABLE' },
      });
    });

    it('refuses animals that are not available', async () => {
      const animal = await createAnimal(context.prisma, { status: 'RESERVED' });

      expectError(await submit(animal.id), 409, 'ANIMAL_NOT_AVAILABLE');
    });

    it('refuses a second pending request from the same email, ignoring case', async () => {
      const animal = await createAnimal(context.prisma);
      await submit(animal.id).expect(201);

      const response = await submit(animal.id, {
        ...validRequest,
        email: validRequest.email.toUpperCase(),
      });

      expectError(response, 409, 'DUPLICATE_ADOPTION_REQUEST');
    });

    it('accepts a new request once the previous one was resolved', async () => {
      const animal = await createAnimal(context.prisma);
      await createAdoptionRequest(context.prisma, animal.id, {
        email: validRequest.email,
        status: 'REJECTED',
      });

      await submit(animal.id).expect(201);
    });

    it('returns 404 for an unknown animal', async () => {
      expectError(await submit(9999), 404, 'NOT_FOUND');
    });

    it('validates the applicant data', async () => {
      const animal = await createAnimal(context.prisma);

      const response = await submit(animal.id, {
        fullName: '',
        email: 'not-an-email',
        phone: 'abc',
        message: 'krátka',
      });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual([
        'email',
        'fullName',
        'message',
        'phone',
      ]);
    });
  });

  describe('administration', () => {
    it('requires an admin token to list requests', async () => {
      expectError(
        await context.http().get('/api/adoption-requests'),
        401,
        'UNAUTHORIZED',
      );
    });

    it('lists the newest requests first and filters them', async () => {
      const bella = await createAnimal(context.prisma, { name: 'Bella' });
      const max = await createAnimal(context.prisma, { name: 'Max' });
      await createAdoptionRequest(context.prisma, bella.id, {
        fullName: 'Prvá',
        createdAt: new Date('2026-09-01T10:00:00Z'),
      });
      await createAdoptionRequest(context.prisma, max.id, {
        fullName: 'Druhá',
        createdAt: new Date('2026-09-02T10:00:00Z'),
      });
      await createAdoptionRequest(context.prisma, max.id, {
        fullName: 'Tretia',
        email: 'tretia@example.com',
        status: 'REJECTED',
        createdAt: new Date('2026-09-03T10:00:00Z'),
      });

      const all = await context
        .http()
        .get('/api/adoption-requests')
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect(
        all.body.data.map((r: { fullName: string }) => r.fullName),
      ).toEqual(['Tretia', 'Druhá', 'Prvá']);
      expect(all.body.data[0].animal).toMatchObject({ name: 'Max' });

      const filtered = await context
        .http()
        .get(`/api/adoption-requests?status=PENDING&animalId=${max.id}`)
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect(
        filtered.body.data.map((r: { fullName: string }) => r.fullName),
      ).toEqual(['Druhá']);
    });

    it('approving adopts the animal and rejects its other pending requests', async () => {
      const animal = await createAnimal(context.prisma);
      const chosen = await createAdoptionRequest(context.prisma, animal.id);
      const other = await createAdoptionRequest(context.prisma, animal.id, {
        email: 'other@example.com',
      });

      const response = await resolve(chosen.id, 'APPROVED').expect(200);

      expect(response.body).toMatchObject({
        status: 'APPROVED',
        animal: { status: 'ADOPTED' },
      });
      const otherAfter = await context.prisma.adoptionRequest.findUniqueOrThrow(
        {
          where: { id: other.id },
        },
      );
      expect(otherAfter.status).toBe('REJECTED');
    });

    it('does not change a request that was already resolved', async () => {
      const animal = await createAnimal(context.prisma);
      const request = await createAdoptionRequest(context.prisma, animal.id, {
        status: 'REJECTED',
      });

      expectError(
        await resolve(request.id, 'APPROVED'),
        409,
        'ADOPTION_REQUEST_ALREADY_RESOLVED',
      );
    });

    it('only accepts APPROVED or REJECTED', async () => {
      const animal = await createAnimal(context.prisma);
      const request = await createAdoptionRequest(context.prisma, animal.id);

      const response = await resolve(request.id, 'PENDING');

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual(['status']);
    });

    it('cannot approve a request for an animal that is already adopted', async () => {
      const animal = await createAnimal(context.prisma, { status: 'ADOPTED' });
      const request = await createAdoptionRequest(context.prisma, animal.id);

      expectError(
        await resolve(request.id, 'APPROVED'),
        409,
        'ANIMAL_NOT_AVAILABLE',
      );
      const after = await context.prisma.adoptionRequest.findUniqueOrThrow({
        where: { id: request.id },
      });
      expect(after.status).toBe('PENDING');
    });

    it('lets only one of two simultaneous approvals for the same animal win', async () => {
      const animal = await createAnimal(context.prisma);
      const first = await createAdoptionRequest(context.prisma, animal.id);
      const second = await createAdoptionRequest(context.prisma, animal.id, {
        email: 'second@example.com',
      });

      const responses = await Promise.all([
        resolve(first.id, 'APPROVED'),
        resolve(second.id, 'APPROVED'),
      ]);

      expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
      const statuses = await context.prisma.adoptionRequest.findMany({
        select: { status: true },
        orderBy: { status: 'asc' },
      });
      expect(statuses.map((r) => r.status).sort()).toEqual([
        'APPROVED',
        'REJECTED',
      ]);
    });

    it('deletes a request', async () => {
      const animal = await createAnimal(context.prisma);
      const request = await createAdoptionRequest(context.prisma, animal.id);
      const remove = () =>
        context
          .http()
          .delete(`/api/adoption-requests/${request.id}`)
          .auth(token, { type: 'bearer' });

      await remove().expect(204);
      expectError(await remove(), 404, 'NOT_FOUND');
    });
  });
});
