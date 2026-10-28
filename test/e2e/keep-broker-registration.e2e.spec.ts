import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const registrationNumber = 'REG-0001';
const dailyCheck = 'brokerage.check-registration';

/** The system actor of credit-application that keeps the registrations: the reset of the database empties its relationships. */
const keepRegistrationSystemActor = 'system:system:credit-application.keep-broker-registration';

describe('Keep broker registration, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepRegistrationSystemActor,
    });
  });

  it('answers the registration in force, since the day brokerage registered the broker', async () => {
    const bank = await openBank(application);
    const brokerId = await registerBroker(application, bank);

    await application.settled();

    const decider = await deciderOf(application, bank);
    const answer = expectStatus(await decider.get(`/brokers/${brokerId}/registration`), 200);

    expect(answer.body).toMatchObject({ brokerId, inForce: true, since: expect.any(String) });
  });

  it('answers the registration lapsed, until the day the daily check lapsed it', async () => {
    const bank = await openBank(application);
    const brokerId = await registerBroker(application, bank);

    application.register.revoke(registrationNumber);
    await application.runJob(dailyCheck);
    await application.settled();
    await expectJobAuditedFor(application, dailyCheck, bank);

    const decider = await deciderOf(application, bank);
    const answer = expectStatus(await decider.get(`/brokers/${brokerId}/registration`), 200);

    expect(answer.body).toMatchObject({ brokerId, inForce: false, until: expect.any(String) });
  });

  it('refuses a broker that brokerage never registered, with the code UNKNOWN_BROKER_REGISTRATION', async () => {
    const bank = await openBank(application);
    const decider = await deciderOf(application, bank);

    const response = await decider.get('/brokers/unknown-broker/registration');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_BROKER_REGISTRATION' });
  });
});

/** Opens the bank as an administrator of identity: its id is the tenant the work of the bank runs in. */
async function openBank(app: RunningApplication): Promise<string> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  const opened = expectStatus(await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' }), 201);

  return (opened.body as { id: string }).id;
}

/** Registers a broker of the bank while its registration is valid, and returns its id. */
async function registerBroker(app: RunningApplication, bank: string): Promise<string> {
  await app.relate({ object: 'context:brokerage', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'], tenantId: bank });

  app.register.markValid(registrationNumber);
  const created = expectStatus(await ada.post('/brokers', { registrationNumber }), 201);

  return (created.body as { id: string }).id;
}

/** A decider of the bank holds the decision of credit-application: an operator of the context. */
async function deciderOf(app: RunningApplication, bank: string) {
  await app.relate({ object: 'context:credit-application', relation: 'operator', subject: 'user:decider-1' });

  return app.as({ id: 'decider-1', tenantId: bank });
}
