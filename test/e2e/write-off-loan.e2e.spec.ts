import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { servicingOperator, storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

const LOAN_ID = 'loan-1';
const PAID_OUT_AT = new Date('2026-03-01T00:00:00.000Z');
const PRINCIPAL_CENTS = 100_000;

describe('Write off loan, end to end', () => {
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
    const response = await application.client.post(`/loans/${LOAN_ID}/write-off`, {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post(`/loans/${LOAN_ID}/write-off`, {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);
    });

    // Exact on names and structure: the fact is announced after the save, under the unit of work.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /loans/:id/write-off',
        kind: 'SERVER',
        children: [
          {
            name: 'command WriteOffLoanCommand',
            children: [
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event servicing.loan.written-off' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 204 and records the outstanding capital written off, the loan ending', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);

    expect(await storedEventsText(application)).toContain(`"amountCents":${PRINCIPAL_CENTS}`);
  });

  it('refuses a second write-off of the same loan with LOAN_ALREADY_CLOSED', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);

    const response = await ada.post(`/loans/${LOAN_ID}/write-off`, {});

    expect(response.body).toMatchObject({ code: 'LOAN_ALREADY_CLOSED' });
  });

  it('refuses the write-off of a loan repaid in full, which has nothing to write off', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: PRINCIPAL_CENTS }), 204);

    const response = await ada.post(`/loans/${LOAN_ID}/write-off`, {});

    expect(response.body).toMatchObject({ code: 'LOAN_ALREADY_CLOSED' });
  });

  it('refuses the write-off of a loan that does not exist with UNKNOWN_LOAN', async () => {
    const ada = await servicingOperator(application, 'ada');

    const response = await ada.post('/loans/no-such-loan/write-off', {});

    expect(response.body).toMatchObject({ code: 'UNKNOWN_LOAN' });
  });
});
