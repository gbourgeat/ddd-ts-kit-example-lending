import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { installTestTracing, type SpanNode } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import { onDay, signedOfferOn } from '$test/e2e/support/credit-application/signed-offer-world';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { borrowerOf } from '$test/e2e/support/servicing/payout-authorised';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

const ISSUED_ON = new Date('2026-04-01T09:00:00.000Z');
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const EIGHTH_DAY_AFTER_SIGNING = new Date('2026-04-10T09:00:00.000Z');
/** The first instalment falls due one month after the payout. */
const FIRST_INSTALMENT_NIGHT = new Date('2026-05-10T09:00:00.000Z');
const COMPUTE_JOB = 'servicing.compute-due-instalments';

describe('From an approved application to the first instalment collected, end to end', () => {
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
    await keepDecisionReads(application);
    await keepOfferReads(application);
    await publishDelegationTable(application);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the loan when the payout is authorised, and collects its first instalment on the night it falls due', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);

    await openBank(application, BANK_TENANT);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    expectStatus(await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {}), 204);
    await application.settled();

    await servicingOperatorAt(application, 'ada', FIRST_INSTALMENT_NIGHT);
    await application.runJob(COMPUTE_JOB);
    await application.settled();

    const borrower = await borrowerOf(application, 'bob', offer.applicationId);
    const loan = expectStatus(await borrower.get(`/loans/${offer.applicationId}`), 200);

    expect(loan.body).toMatchObject({ loanId: offer.applicationId, instalmentsDue: [1], instalmentsPaid: [1] });
  });

  it('is one trace from the request of the payout to the loan servicing opens, through the outbox', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);

    await openBank(application, BANK_TENANT);
    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {}), 204);
      await application.settled();
    });

    const names = namesOf(trace);

    expect(names).toContain('POST /applications/:id/payout-authorisation');
    expect(names).toContain('command RecordPayoutCommand');
  });
});

/** The names of the spans of a trace, whatever their depth. */
function namesOf(spans: readonly SpanNode[]): string[] {
  return spans.flatMap((span) => [span.name, ...namesOf(span.children)]);
}
