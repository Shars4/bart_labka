import { JwtService } from '@nestjs/jwt';
import {
  ADMIN,
  type TestContext,
  USER,
  createAdoptionRequest,
  createAnimal,
  createTestApp,
  createUser,
  expectError,
  invalidFields,
  login,
  loginAsAdmin,
  resetDatabase,
} from './helpers.js';
import { TEST_ENV } from './test-env.js';

const NEW_USER = {
  name: 'Nová Používateľka',
  email: 'nova@test.local',
  password: 'Nove-Heslo-123',
};

/** The token from the link in the last verification email to `email`. */
function verificationToken(context: TestContext, email: string): string {
  const message = context.outbox.findLast((mail) => mail.to.includes(email));
  const match = message?.text.match(/overenie-emailu\?token=([^\s]+)/);
  if (!match) {
    throw new Error(`No verification email to ${email}`);
  }
  return decodeURIComponent(match[1]);
}

/** Signs tokens with the test secret, e.g. expired or of the wrong kind. */
function signTestToken(payload: object, audience: string): Promise<string> {
  return new JwtService({ secret: TEST_ENV.JWT_SECRET }).signAsync(payload, {
    issuer: 'utulok-labka-api',
    audience,
  });
}

const NEW_USER_CREDENTIALS = {
  email: NEW_USER.email,
  password: NEW_USER.password,
};

describe('User accounts', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(context.prisma);
    context.outbox.length = 0;
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('registration and email verification', () => {
    it('creates an unverified USER account and emails a verification link', async () => {
      const response = await context
        .http()
        .post('/api/auth/register')
        .send({ ...NEW_USER, email: ' Nova@Test.local ' })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number),
        email: NEW_USER.email,
        name: NEW_USER.name,
        role: 'USER',
        emailVerified: false,
      });
      expect(context.outbox).toHaveLength(1);
      expect(context.outbox[0]).toMatchObject({
        to: [NEW_USER.email],
        subject: 'Overte svoj email v Útulku Labka',
      });
      expect(context.outbox[0].html).toContain('/overenie-emailu?token=');
    });

    it('lets the user sign in only after the email is verified', async () => {
      await context
        .http()
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(201);

      expectError(
        await context.http().post('/api/auth/login').send(NEW_USER_CREDENTIALS),
        403,
        'EMAIL_NOT_VERIFIED',
      );
      // A wrong password does not reveal that the account is unverified.
      expectError(
        await context
          .http()
          .post('/api/auth/login')
          .send({ ...NEW_USER_CREDENTIALS, password: 'wrong-password' }),
        401,
        'INVALID_CREDENTIALS',
      );

      const token = verificationToken(context, NEW_USER.email);
      const verified = await context
        .http()
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(200);
      expect(verified.body).toMatchObject({ emailVerified: true });

      const signedIn = await context
        .http()
        .post('/api/auth/login')
        .send(NEW_USER_CREDENTIALS)
        .expect(200);
      expect(signedIn.body.user).toMatchObject({ role: 'USER' });

      // Opening the link again changes nothing.
      await context
        .http()
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(200);
    });

    it('refuses an email that already has an account', async () => {
      const response = await context
        .http()
        .post('/api/auth/register')
        .send({ ...NEW_USER, email: ADMIN.email });

      expectError(response, 409, 'EMAIL_TAKEN');
      expect(context.outbox).toHaveLength(0);
    });

    it('validates the registration', async () => {
      const response = await context.http().post('/api/auth/register').send({
        name: 'X',
        email: 'not-an-email',
        password: 'kratke',
        role: 'ADMIN',
      });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual([
        'email',
        'name',
        'password',
        'role',
      ]);
    });

    it('limits the password to 72 bytes, not characters', async () => {
      const response = await context
        .http()
        .post('/api/auth/register')
        .send({ ...NEW_USER, password: 'ž'.repeat(37) });

      expectError(response, 400, 'VALIDATION_ERROR');
      expect(invalidFields(response)).toEqual(['password']);
    });

    it.each([
      ['malformed', () => Promise.resolve('not-a-token')],
      [
        'expired',
        () =>
          signTestToken(
            {
              sub: '2',
              email: NEW_USER.email,
              exp: Math.floor(Date.now() / 1000) - 60,
            },
            'email-verification',
          ),
      ],
      [
        'an access token',
        () =>
          signTestToken(
            { sub: '2', email: NEW_USER.email, role: 'USER' },
            'access',
          ),
      ],
    ])('rejects a %s verification token', async (_case, makeToken) => {
      await context
        .http()
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(201);

      const response = await context
        .http()
        .post('/api/auth/verify-email')
        .send({ token: await makeToken() });

      expectError(response, 400, 'INVALID_VERIFICATION_TOKEN');
    });

    it('does not accept a verification token as an access token', async () => {
      await context
        .http()
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(201);
      const token = verificationToken(context, NEW_USER.email);

      expectError(
        await context
          .http()
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' }),
        401,
        'UNAUTHORIZED',
      );
    });

    it('resends the link only to unverified accounts, with the same answer for everyone', async () => {
      await context
        .http()
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(201);
      context.outbox.length = 0;

      for (const email of [NEW_USER.email, ADMIN.email, 'nobody@test.local']) {
        const response = await context
          .http()
          .post('/api/auth/resend-verification')
          .send({ email })
          .expect(202);
        expect(response.body).toEqual({});
      }

      expect(context.outbox.map((mail) => mail.to)).toEqual([[NEW_USER.email]]);
    });
  });

  describe('roles', () => {
    it('gives a USER their profile but no admin endpoints', async () => {
      await createUser(context.prisma);
      const token = await login(context, USER);

      const me = await context
        .http()
        .get('/api/auth/me')
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect(me.body).toMatchObject({ email: USER.email, role: 'USER' });

      for (const request of [
        () => context.http().get('/api/adoption-requests'),
        () => context.http().get('/api/stats'),
        () => context.http().post('/api/animals').send({}),
        () => context.http().delete('/api/animals/1'),
      ]) {
        expectError(
          await request().auth(token, { type: 'bearer' }),
          403,
          'FORBIDDEN',
        );
      }
    });
  });

  describe('adoption requests of signed-in users', () => {
    it('links the request to the account and uses the account email', async () => {
      const user = await createUser(context.prisma);
      const token = await login(context, USER);
      const animal = await createAnimal(context.prisma);

      const response = await context
        .http()
        .post(`/api/animals/${animal.id}/adoption-requests`)
        .auth(token, { type: 'bearer' })
        .send({
          fullName: 'Test Používateľ',
          email: 'someone-else@test.local',
          message: 'Radi by sme si psa adoptovali.',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        userId: user.id,
        email: USER.email,
      });
    });

    it('treats an invalid token on the public form as an anonymous visitor', async () => {
      const animal = await createAnimal(context.prisma);

      const response = await context
        .http()
        .post(`/api/animals/${animal.id}/adoption-requests`)
        .auth('expired.or.invalid', { type: 'bearer' })
        .send({
          fullName: 'Anonymný Záujemca',
          email: 'anonym@test.local',
          message: 'Radi by sme si psa adoptovali.',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        userId: null,
        email: 'anonym@test.local',
      });
    });

    it('lists own requests, including earlier anonymous ones from the same email', async () => {
      const user = await createUser(context.prisma);
      const token = await login(context, USER);
      const [first, second] = await Promise.all([
        createAnimal(context.prisma, { name: 'Prvý' }),
        createAnimal(context.prisma, { name: 'Druhý' }),
      ]);
      await createAdoptionRequest(context.prisma, first.id, {
        userId: user.id,
        email: USER.email,
      });
      await createAdoptionRequest(context.prisma, second.id, {
        email: USER.email,
        status: 'REJECTED',
      });
      await createAdoptionRequest(context.prisma, first.id, {
        email: 'someone-else@test.local',
      });

      const response = await context
        .http()
        .get('/api/me/adoption-requests')
        .auth(token, { type: 'bearer' })
        .expect(200);

      expect(response.body.meta).toMatchObject({ total: 2 });
      expect(
        response.body.data.map(
          (request: { animal: { name: string } }) => request.animal.name,
        ),
      ).toEqual(expect.arrayContaining(['Prvý', 'Druhý']));
    });

    it('requires signing in to list own requests', async () => {
      expectError(
        await context.http().get('/api/me/adoption-requests'),
        401,
        'UNAUTHORIZED',
      );
    });

    it('works for admins too (any signed-in account)', async () => {
      const token = await loginAsAdmin(context);
      await context
        .http()
        .get('/api/me/adoption-requests')
        .auth(token, { type: 'bearer' })
        .expect(200);
    });
  });
});
