import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { declareConflictAs } from '$test/e2e/support/credit-application/decision-world';
import { advisedApplication, advisorClient } from '$test/e2e/support/credit-application/access-explanation-world';

describe('Explain refusal to a conflicted advisor, end to end', () => {
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

  it('refuses the advisor who declared a conflict on the customer with the rule declared conflict, 403', async () => {
    const { applicationId, customerId, advisorId, accountId } = await advisedApplication(application);

    await declareConflictAs(application, accountId, customerId);
    const advisor = await advisorClient(application, advisorId);

    const response = await advisor.get(`/applications/${applicationId}/access-explanation`);

    expectStatus(response, 422);

    expect(response.body).toMatchObject({
      code: 'APPLICATION_NOT_VISIBLE',
      facts: { rules: ['declared-conflict'] },
    });
  });
});
