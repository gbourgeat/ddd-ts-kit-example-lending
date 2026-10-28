import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { servicingOperator, storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

const LOAN_ID = 'loan-1';
const PAID_OUT_AT = new Date('2026-03-01T00:00:00.000Z');
const PRINCIPAL_CENTS = 100_000;

describe('Reverse write off, end to end', () => {
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
    const response = await application.client.post(`/loans/${LOAN_ID}/write-off-reversal`, {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post(`/loans/${LOAN_ID}/write-off-reversal`, {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {}), 204);
    });

    // Exact on names and structure: the fact is announced after the save, under the unit of work.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /loans/:id/write-off-reversal',
        kind: 'SERVER',
        children: [
          {
            name: 'command ReverseWriteOffCommand',
            children: [
              { name: 'repository LoanRepository.findById' },
              { name: 'repository LoanRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event servicing.loan.write-off-reversed' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 204 and records the reversal, the write-off staying in the ledger unedited', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {}), 204);

    const stored = await storedEventsText(application);

    expect(stored).toContain('servicing.loan.written-off');
    expect(stored).toContain('servicing.loan.write-off-reversed');
  });

  it('re-opens the outstanding capital: the loan can be repaid in full again', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);
    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {}), 204);

    const response = await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: PRINCIPAL_CENTS });

    expectStatus(response, 204);
  });

  it('refuses the reversal of a loan that was not written off with LOAN_NOT_WRITTEN_OFF', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    const response = await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {});

    expect(response.body).toMatchObject({ code: 'LOAN_NOT_WRITTEN_OFF' });
  });

  it('refuses a second reversal of the same write-off with LOAN_NOT_WRITTEN_OFF', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_AT, 12);
    const ada = await servicingOperator(application, 'ada');

    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off`, {}), 204);
    expectStatus(await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {}), 204);

    const response = await ada.post(`/loans/${LOAN_ID}/write-off-reversal`, {});

    expect(response.body).toMatchObject({ code: 'LOAN_NOT_WRITTEN_OFF' });
  });
});
