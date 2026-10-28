import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { servicingOperator, storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

const PAID_OUT_AT = new Date('2026-03-01T00:00:00.000Z');

describe('Close loan, end to end', () => {
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
    const response = await application.client.post('/loans/id-1/closure', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/loans/id-1/closure', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await storePaidOutLoan(application, 'loan-1', PAID_OUT_AT);
    const ada = await servicingOperator(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/loans/loan-1/closure', {}), 204);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /loans/:id/closure',
        kind: 'SERVER',
        children: [
          {
            name: 'command CloseLoanCommand',
            children: [
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event servicing.loan.closed' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 204 and stores the closure of the loan to an operator of servicing', async () => {
    await storePaidOutLoan(application, 'loan-1', PAID_OUT_AT);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post('/loans/loan-1/closure', {}), 204);

    expect(await storedEventsText(application)).toContain('servicing.loan.closed');
  });

  it('refuses a second closure of the same loan with LOAN_ALREADY_CLOSED', async () => {
    await storePaidOutLoan(application, 'loan-1', PAID_OUT_AT);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post('/loans/loan-1/closure', {}), 204);

    const response = await ada.post('/loans/loan-1/closure', {});

    expect(response.body).toMatchObject({ code: 'LOAN_ALREADY_CLOSED' });
  });

  it('refuses the closure of a loan that does not exist with UNKNOWN_LOAN', async () => {
    const ada = await servicingOperator(application, 'ada');

    const response = await ada.post('/loans/no-such-loan/closure', {});

    expect(response.body).toMatchObject({ code: 'UNKNOWN_LOAN' });
  });
});
