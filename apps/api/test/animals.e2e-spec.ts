import { todayInShelter } from '../src/common/dates.js';
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

const validAnimal = {
  name: 'Fifo',
  species: 'DOG',
  sex: 'MALE',
  size: 'SMALL',
  description: 'Fifo je malý veselý psík, ktorý miluje loptičky.',
};

describe('Animals', () => {
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

  const names = (body: { data: { name: string }[] }) =>
    body.data.map((animal) => animal.name);

  describe('GET /api/animals', () => {
    beforeEach(async () => {
      await createAnimal(context.prisma, {
        name: 'Bella',
        breed: 'Labradorský retriever',
        intakeDate: new Date('2026-02-03'),
      });
      await createAnimal(context.prisma, {
        name: 'Tigrík',
        species: 'CAT',
        breed: 'Kríženec',
        intakeDate: new Date('2026-08-05'),
      });
      await createAnimal(context.prisma, {
        name: 'Rocky',
        status: 'RESERVED',
        intakeDate: new Date('2026-01-08'),
      });
    });

    it('lists the most recently admitted animals first, with metadata', async () => {
      const response = await context.http().get('/api/animals').expect(200);

      expect(names(response.body)).toEqual(['Tigrík', 'Bella', 'Rocky']);
      expect(response.body.meta).toEqual({
        page: 1,
        pageSize: 12,
        total: 3,
        totalPages: 1,
      });
    });

    it('combines filters', async () => {
      const response = await context
        .http()
        .get('/api/animals?species=DOG&status=AVAILABLE')
        .expect(200);

      expect(names(response.body)).toEqual(['Bella']);
    });

    it.each([
      ['TIGRIK', ['Tigrík']],
      ['kriz', ['Tigrík']],
      ['retriever', ['Bella']],
      ['%', []],
    ])(
      'searches name and breed for "%s" ignoring case and diacritics',
      async (q, expected) => {
        const response = await context
          .http()
          .get('/api/animals')
          .query({ q })
          .expect(200);

        expect(names(response.body)).toEqual(expected);
      },
    );

    it('paginates', async () => {
      const response = await context
        .http()
        .get('/api/animals?pageSize=2&page=2')
        .expect(200);

      expect(names(response.body)).toEqual(['Rocky']);
      expect(response.body.meta).toMatchObject({ total: 3, totalPages: 2 });
    });

    it('rejects invalid query parameters', async () => {
      const response = await context
        .http()
        .get('/api/animals?pageSize=500&species=FISH&page=0');

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual(['page', 'pageSize', 'species']);
    });
  });

  describe('GET /api/animals/:id', () => {
    it('returns the animal with date-only dates and no internal fields', async () => {
      const animal = await createAnimal(context.prisma, {
        birthDate: new Date('2022-04-12'),
      });

      const response = await context
        .http()
        .get(`/api/animals/${animal.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: animal.id,
        birthDate: '2022-04-12',
        intakeDate: '2026-01-15',
        status: 'AVAILABLE',
      });
      expect(response.body).not.toHaveProperty('createdById');
    });

    it('returns 404 for an unknown animal', async () => {
      const response = await context.http().get('/api/animals/9999');

      expectError(response, 404, 'NOT_FOUND');
      expect(response.body.message).toBe('Zviera s ID 9999 neexistuje.');
    });

    it.each(['abc', '1.5', '0', '99999999999'])(
      'rejects the id "%s"',
      async (id) => {
        const response = await context.http().get(`/api/animals/${id}`);

        expectError(response, 400, 'VALIDATION_ERROR');
        expect(invalidFields(response)).toEqual(['id']);
      },
    );
  });

  describe('POST /api/animals', () => {
    it('requires an admin token', async () => {
      const response = await context
        .http()
        .post('/api/animals')
        .send(validAnimal);

      expectError(response, 401, 'UNAUTHORIZED');
    });

    it('creates the animal with defaults and returns its location', async () => {
      const response = await context
        .http()
        .post('/api/animals')
        .auth(token, { type: 'bearer' })
        .send({ ...validAnimal, name: '  Fifo ', breed: '  ' })
        .expect(201);

      expect(response.headers.location).toBe(
        `/api/animals/${response.body.id}`,
      );
      expect(response.body).toMatchObject({
        name: 'Fifo',
        breed: null,
        status: 'AVAILABLE',
        intakeDate: todayInShelter(),
        isVaccinated: false,
      });
      const stored = await context.prisma.animal.findUniqueOrThrow({
        where: { id: response.body.id },
      });
      expect(stored.createdById).toBe(1);
    });

    it('reports every invalid field', async () => {
      const response = await context
        .http()
        .post('/api/animals')
        .auth(token, { type: 'bearer' })
        .send({});

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual([
        'description',
        'name',
        'sex',
        'size',
        'species',
      ]);
    });

    it.each([
      ['a birth date in the future', { birthDate: '2999-01-01' }, 'birthDate'],
      ['an impossible date', { birthDate: '2026-02-30' }, 'birthDate'],
      ['a non-existent month', { birthDate: '2026-13-01' }, 'birthDate'],
      [
        'a birth date after the intake date',
        { birthDate: '2026-03-01', intakeDate: '2026-01-01' },
        'birthDate',
      ],
      ['a javascript: URL', { imageUrl: 'javascript:alert(1)' }, 'imageUrl'],
      ['a path traversal', { imageUrl: '/images/../secret.jpg' }, 'imageUrl'],
    ])('rejects %s', async (_case, fields, invalidField) => {
      const response = await context
        .http()
        .post('/api/animals')
        .auth(token, { type: 'bearer' })
        .send({ ...validAnimal, ...fields });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual([invalidField]);
    });
  });

  describe('PATCH /api/animals/:id', () => {
    it('changes only the fields that are sent', async () => {
      const animal = await createAnimal(context.prisma, { breed: 'Bígel' });

      const response = await context
        .http()
        .patch(`/api/animals/${animal.id}`)
        .auth(token, { type: 'bearer' })
        .send({ status: 'RESERVED' })
        .expect(200);

      expect(response.body).toMatchObject({
        name: animal.name,
        breed: 'Bígel',
        status: 'RESERVED',
      });
    });

    it('clears optional fields with null but rejects null for required ones', async () => {
      const animal = await createAnimal(context.prisma, {
        breed: 'Bígel',
        imageUrl: '/images/animals/test.jpg',
      });

      const cleared = await context
        .http()
        .patch(`/api/animals/${animal.id}`)
        .auth(token, { type: 'bearer' })
        .send({ breed: null, imageUrl: null })
        .expect(200);
      expect(cleared.body).toMatchObject({ breed: null, imageUrl: null });

      const rejected = await context
        .http()
        .patch(`/api/animals/${animal.id}`)
        .auth(token, { type: 'bearer' })
        .send({ name: null });
      expectError(rejected, 400, 'VALIDATION_ERROR');
      expect(invalidFields(rejected)).toEqual(['name']);
    });

    it('checks the birth date against the stored intake date', async () => {
      const animal = await createAnimal(context.prisma, {
        intakeDate: new Date('2026-02-03'),
      });

      const response = await context
        .http()
        .patch(`/api/animals/${animal.id}`)
        .auth(token, { type: 'bearer' })
        .send({ birthDate: '2026-05-01' });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual(['birthDate']);
    });

    it('returns 404 for an unknown animal', async () => {
      const response = await context
        .http()
        .patch('/api/animals/9999')
        .auth(token, { type: 'bearer' })
        .send({ name: 'Nikto' });

      expectError(response, 404, 'NOT_FOUND');
    });
  });

  describe('DELETE /api/animals/:id', () => {
    it('deletes the animal together with its adoption requests', async () => {
      const animal = await createAnimal(context.prisma);
      await createAdoptionRequest(context.prisma, animal.id);

      await context
        .http()
        .delete(`/api/animals/${animal.id}`)
        .auth(token, { type: 'bearer' })
        .expect(204);

      await context.http().get(`/api/animals/${animal.id}`).expect(404);
      expect(await context.prisma.adoptionRequest.count()).toBe(0);
    });

    it('returns 404 when the animal does not exist', async () => {
      const response = await context
        .http()
        .delete('/api/animals/9999')
        .auth(token, { type: 'bearer' });

      expectError(response, 404, 'NOT_FOUND');
    });
  });
});
