import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const advisor = { name: 'Grace Hopper', email: 'grace@example.test' };

describe('Advisor gets a portfolio, end to end', () => {
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

  it('opens an empty portfolio for the advisor appointed on the branch, as the system actor', async () => {
    await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada' });

    const opened = await ada.post('/branches', {});

    expectStatus(opened, 201);
    const { id: branchId } = opened.body as { id: string };

    const appointed = await ada.post(`/branches/${branchId}/staff`, advisor);

    expectStatus(appointed, 201);

    // The reaction to the appointment runs before the answer: it opens the portfolio through OpenPortfolio, which
    // refuses the system actor unless its relationship is written. Settling fails if the reaction failed.
    await expect(application.settled()).resolves.toBeUndefined();
  });
});
