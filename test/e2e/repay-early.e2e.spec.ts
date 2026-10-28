import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { servicingOperator, storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

const LOAN_ID = 'loan-1';
const PAID_OUT_AT = new Date('2026-03-01T00:00:00.000Z');

describe('Repay early, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post(`/loans/${LOAN_ID}/early-repayments`, {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: 1 });

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: 1000 }), 204);
    });

    // Exact on names and structure: the fact is announced after the save, under the unit of work.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /loans/:id/early-repayments',
        kind: 'SERVER',
        children: [
          {
            name: 'command RepayEarlyCommand',
            children: [
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event servicing.loan.early-repayment-recorded' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 204 and stores the early repayment as recorded, to an operator of servicing', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: 1000 }), 204);

    expect(await storedEventsText(application)).toContain('servicing.loan.early-repayment-recorded');
  });
});
