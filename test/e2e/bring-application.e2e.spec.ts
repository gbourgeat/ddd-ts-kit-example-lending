import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  brokerOf,
  dailyCheck,
  keepRegistrationSystemActor,
  openBank,
  registerBroker,
  registrationNumber,
} from '$test/e2e/support/credit-application/broker-world';

const request = {
  customerId: 'customer-1',
  productId: 'personal-loan',
  amount: { cents: 1234567, currency: 'EUR' },
  durationMonths: 60,
};

describe('Bring an application as a registered broker, end to end', () => {
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

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/bring', request);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission to bring applications', async () => {
    const bank = await openBank(application);
    const stranger = await application.as({ id: 'stranger', tenantId: bank });

    const response = await stranger.post('/applications/bring', request);

    expectStatus(response, 403);
  });

  it('records the application brought for the customer, and answers 201 with its identifier', async () => {
    const bank = await openBank(application);
    const brokerId = await registerBroker(application, bank);
    const broker = await brokerOf(application, brokerId, bank);

    await application.settled();

    const brought = expectStatus(await broker.post('/applications/bring', request), 201);

    expect(brought.body).toMatchObject({ id: expect.any(String) });
  });

  it('refuses the application of a broker whose registration lapsed: it is no longer a broker of the context, 403', async () => {
    const bank = await openBank(application);
    const brokerId = await registerBroker(application, bank);
    const broker = await brokerOf(application, brokerId, bank);

    application.register.revoke(registrationNumber);
    await application.runJob(dailyCheck);
    await application.settled();
    await expectJobAuditedFor(application, dailyCheck, bank);

    const response = await broker.post('/applications/bring', request);

    expectStatus(response, 403);
  });
});
