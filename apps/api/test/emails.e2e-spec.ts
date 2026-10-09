import {
  ADMIN,
  type TestContext,
  USER,
  createAdoptionRequest,
  createAnimal,
  createTestApp,
  createUser,
  loginAsAdmin,
  resetDatabase,
} from './helpers.js';

describe('Emails about adoption requests', () => {
  let context: TestContext;
  let adminToken: string;

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(context.prisma);
    adminToken = await loginAsAdmin(context);
    context.outbox.length = 0;
  });

  afterAll(async () => {
    await context.app.close();
  });

  const resolve = (id: number, status: 'APPROVED' | 'REJECTED') =>
    context
      .http()
      .patch(`/api/adoption-requests/${id}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ status })
      .expect(200);

  it('confirms a new request to the applicant and notifies the admins', async () => {
    const animal = await createAnimal(context.prisma, { name: 'Bodka' });

    await context
      .http()
      .post(`/api/animals/${animal.id}/adoption-requests`)
      .send({
        fullName: 'Jana Testová',
        email: 'jana@test.local',
        phone: '+421 905 123 456',
        message: 'Máme záhradu a veľa času na prechádzky.',
      })
      .expect(201);

    expect(context.outbox).toHaveLength(2);
    const [toApplicant, toAdmins] = [
      context.outbox.find((mail) => mail.to.includes('jana@test.local')),
      context.outbox.find((mail) => mail.to.includes(ADMIN.email)),
    ];
    expect(toApplicant?.subject).toBe(
      'Prijali sme vašu žiadosť o adopciu: Bodka',
    );
    expect(toAdmins?.subject).toBe('Nová žiadosť o adopciu: Bodka');
    expect(toAdmins?.text).toContain('Máme záhradu a veľa času na prechádzky.');
    expect(toAdmins?.text).toContain('+421 905 123 456');
  });

  it('escapes what applicants write in the HTML version', async () => {
    const animal = await createAnimal(context.prisma);

    await context
      .http()
      .post(`/api/animals/${animal.id}/adoption-requests`)
      .send({
        fullName: 'Jana <b>Testová</b>',
        email: 'jana@test.local',
        message: '<script>alert(1)</script> chceme psa',
      })
      .expect(201);

    const toAdmins = context.outbox.find((mail) =>
      mail.to.includes(ADMIN.email),
    );
    expect(toAdmins?.html).not.toContain('<script>');
    expect(toAdmins?.html).toContain('&lt;script&gt;');
  });

  it('tells every applicant about an approval, including the requests it rejected', async () => {
    await createUser(context.prisma);
    const animal = await createAnimal(context.prisma, { name: 'Bodka' });
    const winner = await createAdoptionRequest(context.prisma, animal.id, {
      email: 'winner@test.local',
    });
    await createAdoptionRequest(context.prisma, animal.id, {
      email: USER.email,
    });

    await resolve(winner.id, 'APPROVED');

    const subjects = Object.fromEntries(
      context.outbox.map((mail) => [mail.to[0], mail.subject]),
    );
    expect(subjects).toEqual({
      'winner@test.local': 'Vaša žiadosť o adopciu bola schválená: Bodka',
      [USER.email]: 'Vaša žiadosť o adopciu: Bodka',
    });
    // Only the applicant with an account gets the link to their requests.
    const toUser = context.outbox.find((mail) => mail.to.includes(USER.email));
    const toWinner = context.outbox.find((mail) =>
      mail.to.includes('winner@test.local'),
    );
    expect(toUser?.text).toContain('/moje-ziadosti');
    expect(toWinner?.text).not.toContain('/moje-ziadosti');
  });

  it('tells the applicant about a rejection', async () => {
    const animal = await createAnimal(context.prisma, { name: 'Bodka' });
    const request = await createAdoptionRequest(context.prisma, animal.id);

    await resolve(request.id, 'REJECTED');

    expect(context.outbox).toEqual([
      expect.objectContaining({
        to: ['jana@example.com'],
        subject: 'Vaša žiadosť o adopciu: Bodka',
      }),
    ]);
  });

  it('sends nothing when the change is refused', async () => {
    const animal = await createAnimal(context.prisma);
    const request = await createAdoptionRequest(context.prisma, animal.id, {
      status: 'REJECTED',
    });

    await context
      .http()
      .patch(`/api/adoption-requests/${request.id}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ status: 'APPROVED' })
      .expect(409);

    expect(context.outbox).toHaveLength(0);
  });
});
