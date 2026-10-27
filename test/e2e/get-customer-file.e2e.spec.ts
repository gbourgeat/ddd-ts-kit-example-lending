import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Get customer file, end to end', () => {
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

  it('lists the file of an identified customer to an operator of the context', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const page = await operator.get('/customer-files');

    expectStatus(page, 200);
    expect(page.body).toMatchObject({ items: [{ id: customerId }], total: 1 });
  });

  it('answers 403 to a signed-in person who does not operate the context', async () => {
    await operatorOf(application, 'ada');
    const stranger = await application.as({ id: 'bob', roles: [] });

    expectStatus(await stranger.get('/customer-files'), 403);
  });

  it('keeps an entry of the read in the audit trail, written without the use case asking for it', async () => {
    const operator = await operatorOf(application, 'ada');

    await registeredCustomer(operator);
    await application.relate({ object: 'context:audit', relation: 'operator', subject: 'user:ada' });

    expectStatus(await operator.get('/customer-files'), 200);

    const trail = await operator.get('/audit/entries?action=GetCustomerFileQuery');
    const { items } = trail.body as { items: { action: string; outcome: string; actorId: string }[] };

    expectStatus(trail, 200);

    expect(items).toContainEqual(
      expect.objectContaining({ action: 'GetCustomerFileQuery', outcome: 'succeeded', actorId: 'ada' }),
    );
  });
});
