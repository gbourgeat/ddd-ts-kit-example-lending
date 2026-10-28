import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

/** The system actors of branch-network whose relationships the reset of the database empties. */
const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

describe('Refresh due diligence, end to end', () => {
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

    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }
  });

  it('refreshes an identified customer, and reads back the date of the refresh and the date it falls due again', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const refreshed = await operator.post(`/customers/${customerId}/refresh`, {
      name: 'Ada Lovelace',
      birthDate: '1990-01-01',
    });

    expectStatus(refreshed, 201);
    expect(refreshed.body).toEqual({ id: customerId });

    const read = await operator.get(`/customers/${customerId}/due-diligence`);
    const { refreshedOn, nextDueOn } = read.body as { refreshedOn: string; nextDueOn: string };

    expectStatus(read, 200);
    expect(read.body).toMatchObject({ customerId });
    expect(new Date(nextDueOn).getUTCFullYear()).toBe(new Date(refreshedOn).getUTCFullYear() + 1);
  });

  it('refuses the refresh of an unknown customer', async () => {
    const operator = await operatorOf(application, 'ada');

    const refreshed = await operator.post('/customers/unknown/refresh', {
      name: 'Ada Lovelace',
      birthDate: '1990-01-01',
    });

    expect(refreshed.status).toBeGreaterThanOrEqual(400);
    expect(refreshed.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
