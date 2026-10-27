import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Screen customer, end to end', () => {
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  beforeAll(async () => {
    provider = await startKeycloakStandIn();
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    await provider.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('screens an identified customer against the lists, as an operator', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const screened = await operator.post(`/customers/${customerId}/screening`, {
      name: 'Ada Lovelace',
      birthDate: '1980-05-01T00:00:00.000Z',
    });

    expectStatus(screened, 201);
    expect(screened.body).toEqual({ id: customerId });
  });

  it('refuses to screen an unknown customer', async () => {
    const operator = await operatorOf(application, 'ada');

    const screened = await operator.post('/customers/unknown/screening', {
      name: 'Ada Lovelace',
      birthDate: '1980-05-01T00:00:00.000Z',
    });

    expect(screened.status).toBeGreaterThanOrEqual(400);
    expect(screened.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
