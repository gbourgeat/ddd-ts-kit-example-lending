import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const dailyCheck = 'brokerage.check-registration';
const registrationLapsed = 'brokerage.broker.registration-lapsed';
const registrationNumber = 'REG-0001';

describe('The daily check of the broker registrations, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('publishes registration-lapsed for the broker whose registration the register revoked, in its bank', async () => {
    const bank = await openBank(application);
    const brokerId = await registerBroker(application, bank);

    application.register.revoke(registrationNumber);
    const published = collectEvents(application.events, [registrationLapsed]);

    await application.runJob(dailyCheck);
    await application.settled();
    published.stop();

    const [event] = published.received(registrationLapsed);

    expect(event).toMatchObject({ tenantId: bank, payload: { brokerId } });
  });

  it('publishes nothing for a broker whose registration is still valid', async () => {
    const bank = await openBank(application);

    await registerBroker(application, bank);
    const published = collectEvents(application.events, [registrationLapsed]);

    await application.runJob(dailyCheck);
    await application.settled();
    published.stop();

    expect(published.received(registrationLapsed)).toHaveLength(0);
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
