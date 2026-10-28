import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';

describe('Dismiss match, end to end', () => {
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

  it('dismisses the possible match of a customer, with its reason', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const ada = await operatorOf(application, 'ada');
    const identified = expectStatus(await ada.post('/customers', aPersonBody('12AB34567')), 201);
    const { id: customerId } = identified.body as { id: string };

    const dismissed = await ada.post(`/customers/${customerId}/matches/dismiss`, {
      reason: 'Another Ada Lovelace, born in another country',
    });

    expectStatus(dismissed, 201);
    expect(dismissed.body).toEqual({ id: customerId });
  });

  it('refuses to dismiss the match of a customer with no possible match pending', async () => {
    const ada = await operatorOf(application, 'ada');

    const identified = expectStatus(
      await ada.post('/customers', { ...aPersonBody('98ZY76543'), name: 'Grace Hopper' }),
      201,
    );

    const { id: customerId } = identified.body as { id: string };

    const dismissed = await ada.post(`/customers/${customerId}/matches/dismiss`, { reason: 'Nothing to clear' });

    expect(dismissed.status).toBeGreaterThanOrEqual(400);
    expect(dismissed.body).toMatchObject({ code: 'NO_POSSIBLE_MATCH' });
  });

  it('refuses to dismiss the match of an unknown customer', async () => {
    const ada = await operatorOf(application, 'ada');

    const dismissed = await ada.post('/customers/unknown/matches/dismiss', { reason: 'Nothing to clear' });

    expect(dismissed.status).toBeGreaterThanOrEqual(400);
    expect(dismissed.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
