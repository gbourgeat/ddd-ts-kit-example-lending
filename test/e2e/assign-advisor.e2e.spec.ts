import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Assign advisor, end to end', () => {
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

  it('gives an identified customer its advisor, as an operator', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const assigned = await operator.put(`/customers/${customerId}/advisor`, { advisorId: 'advisor-1' });

    expectStatus(assigned, 200);
    expect(assigned.body).toEqual({ id: customerId });
  });

  it('refuses the advisor of an unknown customer, and assigns nothing', async () => {
    const operator = await operatorOf(application, 'ada');

    const assigned = await operator.put('/customers/unknown/advisor', { advisorId: 'advisor-1' });

    expect(assigned.status).toBeGreaterThanOrEqual(400);
    expect(assigned.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
