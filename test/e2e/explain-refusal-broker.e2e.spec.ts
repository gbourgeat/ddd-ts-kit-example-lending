import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  brokerOf,
  keepRegistrationSystemActor,
  openBank,
  registerBroker,
} from '$test/e2e/support/credit-application/broker-world';

const request = {
  customerId: 'customer-1',
  productId: 'personal-loan',
  amount: { cents: 1234567, currency: 'EUR' },
  durationMonths: 60,
};

const otherRegistration = 'REG-0002';

describe('Explain refusal to a broker who did not bring the application, end to end', () => {
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

  it('refuses the broker who did not bring the started application with the rule not brought by you, 422', async () => {
    const { applicationId, other } = await startedApplicationAndOtherBroker();

    const response = await other.get(`/applications/${applicationId}/access-explanation`);

    expectStatus(response, 422);

    expect(response.body).toMatchObject({
      code: 'APPLICATION_NOT_VISIBLE',
      facts: { rules: expect.arrayContaining(['not-brought-by-you']) },
    });
  });

  it('gives the broker who did not bring the application no content of the file: no score, no register result, no customer', async () => {
    const { applicationId, other } = await startedApplicationAndOtherBroker();

    const response = await other.get(`/applications/${applicationId}/access-explanation`);

    expect(JSON.stringify(response.body)).not.toMatch(/score|register|customer-1/i);
  });

  /** A broker brings an application for a customer, and a second broker of the bank, who did not bring it, is returned. */
  async function startedApplicationAndOtherBroker(): Promise<{
    applicationId: string;
    other: Awaited<ReturnType<typeof brokerOf>>;
  }> {
    const bank = await openBank(application);
    const bringingId = await registerBroker(application, bank);
    const bringing = await brokerOf(application, bringingId, bank);

    await application.settled();
    const brought = expectStatus(await bringing.post('/applications/bring', request), 201);

    const otherId = await registerBroker(application, bank, otherRegistration);
    const other = await brokerOf(application, otherId, bank);

    await application.settled();

    return { applicationId: (brought.body as { id: string }).id, other };
  }
});
