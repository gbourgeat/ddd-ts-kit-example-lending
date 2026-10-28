import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { assignCustomerToAdvisorOnBranch } from '$test/e2e/support/credit-application/advisor-branch';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

describe('Submit application with its branch, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  it('publishes the submission as version 2, carrying the branch of the advisor whose portfolio holds the customer', async () => {
    const { branchId } = await assignCustomerToAdvisorOnBranch(application, 'customer-7', tenantId);

    await application.relate({ object: 'customer:customer-7', relation: 'self', subject: 'user:customer-7' });
    const customer = await application.as({ id: 'customer-7', tenantId });
    const submitted = collectEvents(application.events, ['credit-application.credit-application.submitted']);

    expectStatus(await customer.post('/applications', request), 201);
    await application.settled();

    const events = submitted.received();

    expect(events).toHaveLength(1);

    expect(events[0]).toMatchObject({
      version: 2,
      payload: { applicantId: 'customer-7', requestedAmountCents: 1234567, branchId },
    });
  });
});
