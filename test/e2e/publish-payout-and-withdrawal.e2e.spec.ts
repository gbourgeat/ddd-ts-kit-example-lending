import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import { onDay, signedOfferOn } from '$test/e2e/support/credit-application/signed-offer-world';

const payoutAuthorised = 'credit-application.credit-application.payout-authorised';
const withdrawn = 'credit-application.credit-application.withdrawn';

const ISSUED_ON = new Date('2026-04-01T09:00:00.000Z');
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const THREE_DAYS_AFTER_SIGNING = new Date('2026-04-05T09:00:00.000Z');
const EIGHTH_DAY_AFTER_SIGNING = new Date('2026-04-10T09:00:00.000Z');

describe('Publish the payout authorised and the withdrawal for servicing, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
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

  it('publishes the borrower, the branch and the signed terms when the payout is authorised', async () => {
    const received = collectEvents(application.events, [payoutAuthorised]);
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    expectStatus(await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {}), 204);
    await application.settled();
    received.stop();

    const [event] = received.received(payoutAuthorised);

    expect(event?.payload).toMatchObject({
      creditApplicationId: offer.applicationId,
      customerId: offer.applicantId,
      durationMonths: expect.any(Number),
      amountCents: expect.any(Number),
      rateBasisPoints: expect.any(Number),
    });
  });

  it('publishes the withdrawal of the application for servicing', async () => {
    const received = collectEvents(application.events, [withdrawn]);
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, THREE_DAYS_AFTER_SIGNING);

    expectStatus(await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {}), 204);
    await application.settled();
    received.stop();

    expect(received.received(withdrawn).map((event) => event.payload)).toEqual([
      { creditApplicationId: offer.applicationId },
    ]);
  });
});
