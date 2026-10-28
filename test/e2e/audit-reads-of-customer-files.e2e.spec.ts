import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

interface AuditPage {
  readonly items: { action: string; outcome: string; actorId: string }[];
}

describe('The audit search returns the reads of customer files, end to end', () => {
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

  it('keeps an entry of the read of the due diligence of a customer', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    await application.relate({ object: 'context:audit', relation: 'operator', subject: 'user:ada' });
    expectStatus(await operator.get(`/customers/${customerId}/due-diligence`), 200);

    const trail = expectStatus(await operator.get('/audit/entries?action=GetCustomerDueDiligenceQuery'), 200);

    expect((trail.body as AuditPage).items).toContainEqual(
      expect.objectContaining({ action: 'GetCustomerDueDiligenceQuery', outcome: 'succeeded', actorId: 'ada' }),
    );
  });

  it('keeps an entry of the read of the risk rating of a customer', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    await application.relate({ object: 'context:audit', relation: 'operator', subject: 'user:ada' });
    expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating: 'high' }), 200);
    expectStatus(await operator.get(`/customers/${customerId}/risk-rating`), 200);

    const trail = expectStatus(await operator.get('/audit/entries?action=GetCustomerRiskRatingQuery'), 200);

    expect((trail.body as AuditPage).items).toContainEqual(
      expect.objectContaining({ action: 'GetCustomerRiskRatingQuery', outcome: 'succeeded', actorId: 'ada' }),
    );
  });
});
