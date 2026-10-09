import { JwtService } from '@nestjs/jwt';
import { hashPassword } from '../src/auth/password.js';
import {
  ADMIN,
  type TestContext,
  createTestApp,
  expectError,
  invalidFields,
  loginAsAdmin,
  resetDatabase,
} from './helpers.js';

describe('Auth', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
    await resetDatabase(context.prisma);
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns an access token and the user without the password hash', async () => {
      const response = await context
        .http()
        .post('/api/auth/login')
        .send(ADMIN)
        .expect(200);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { id: 1, email: ADMIN.email, name: 'Test Admin', role: 'ADMIN' },
      });
    });

    it('ignores case and surrounding whitespace in the email', async () => {
      await context
        .http()
        .post('/api/auth/login')
        .send({
          email: `  ${ADMIN.email.toUpperCase()} `,
          password: ADMIN.password,
        })
        .expect(200);
    });

    it.each([
      ['a wrong password', { email: ADMIN.email, password: 'wrong-password' }],
      [
        'an unknown email',
        { email: 'nobody@test.local', password: ADMIN.password },
      ],
    ])('rejects %s with the same error', async (_case, credentials) => {
      const response = await context
        .http()
        .post('/api/auth/login')
        .send(credentials);

      expectError(response, 401, 'INVALID_CREDENTIALS');
      expect(response.body.message).toBe('Nesprávny email alebo heslo.');
    });

    it('reports each missing field with a Slovak message', async () => {
      const response = await context.http().post('/api/auth/login').send({});

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(response.body.details).toEqual([
        { field: 'email', message: 'Zadajte email.' },
        { field: 'password', message: 'Zadajte heslo.' },
      ]);
    });

    it('rejects fields that are not part of the contract', async () => {
      const response = await context
        .http()
        .post('/api/auth/login')
        .send({ ...ADMIN, role: 'ADMIN' });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual(['role']);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the user the token belongs to', async () => {
      const token = await loginAsAdmin(context);

      const response = await context
        .http()
        .get('/api/auth/me')
        .auth(token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toMatchObject({
        email: ADMIN.email,
        role: 'ADMIN',
      });
    });

    it('requires a token', async () => {
      expectError(
        await context.http().get('/api/auth/me'),
        401,
        'UNAUTHORIZED',
      );
    });

    it('rejects a token signed with a different secret', async () => {
      const forged = await new JwtService({
        secret: 'some-other-secret-0123456789abcdef',
      }).signAsync(
        { sub: '1', email: ADMIN.email, role: 'ADMIN' },
        { issuer: 'utulok-labka-api' },
      );

      const response = await context
        .http()
        .get('/api/auth/me')
        .auth(forged, { type: 'bearer' });

      expectError(response, 401, 'UNAUTHORIZED');
    });

    it('rejects an unsigned token (alg "none")', async () => {
      const encode = (value: object) =>
        Buffer.from(JSON.stringify(value)).toString('base64url');
      const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
        sub: '1',
        email: ADMIN.email,
        role: 'ADMIN',
        iss: 'utulok-labka-api',
      })}.`;

      const response = await context
        .http()
        .get('/api/auth/me')
        .auth(unsigned, { type: 'bearer' });

      expectError(response, 401, 'UNAUTHORIZED');
    });

    it('rejects a still-valid token of a deleted account', async () => {
      const user = await context.prisma.user.create({
        data: {
          email: 'temporary@test.local',
          name: 'Dočasný správca',
          passwordHash: await hashPassword('Temporary-Password-1'),
        },
      });
      const login = await context
        .http()
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Temporary-Password-1' })
        .expect(200);
      await context.prisma.user.delete({ where: { id: user.id } });

      const response = await context
        .http()
        .get('/api/auth/me')
        .auth(login.body.accessToken, { type: 'bearer' });

      expectError(response, 401, 'UNAUTHORIZED');
    });
  });
});
