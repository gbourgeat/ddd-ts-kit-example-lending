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

describe('Rate customer risk, end to end', () => {
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

  it('rates an identified customer low, medium or high, as an operator', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const rated = await operator.put(`/customers/${customerId}/risk`, { rating: 'high' });

    expectStatus(rated, 200);
    expect(rated.body).toEqual({ id: customerId });

    const read = await operator.get(`/customers/${customerId}/risk-rating`);

    expectStatus(read, 200);
    expect(read.body).toEqual({ customerId, riskRating: 'high' });
  });

  it('refuses the risk rating of an unknown customer', async () => {
    const operator = await operatorOf(application, 'ada');

    const rated = await operator.put('/customers/unknown/risk', { rating: 'low' });

    expect(rated.status).toBeGreaterThanOrEqual(400);
    expect(rated.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
