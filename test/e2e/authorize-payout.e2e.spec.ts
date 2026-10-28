import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';
import { analystOf, submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import { operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import { onDay, signedOfferOn } from '$test/e2e/support/credit-application/signed-offer-world';

/** The offer is issued on this morning and signed the day after: the payout counts its days from the signing. */
const ISSUED_ON = new Date('2026-04-01T09:00:00.000Z');
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const SEVENTH_DAY_AFTER_SIGNING = new Date('2026-04-09T09:00:00.000Z');
const EIGHTH_DAY_AFTER_SIGNING = new Date('2026-04-10T09:00:00.000Z');
const THREE_DAYS_AFTER_SIGNING = new Date('2026-04-05T09:00:00.000Z');
/** Years later, after the five-year cycle of due diligence has passed: the customer is overdue, and not eligible to a payout. */
const OVERDUE_ON = new Date('2031-10-29T09:00:00.000Z');

describe('Authorise the payout no earlier than the 8th day after signing, end to end', () => {
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

  it('answers 401 to a caller who presents no credential', async () => {
    expectStatus(await application.client.post('/applications/application-1/payout-authorisation', {}), 401);
  });

  it('answers 403 to a caller who is not a staff member of the context', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const stranger = await onDay(application, 'stranger', EIGHTH_DAY_AFTER_SIGNING);

    expectStatus(await stranger.post(`/applications/${offer.applicationId}/payout-authorisation`, {}), 403);
  });

  it('refuses the payout on the 7th day after the signing, by its code, carrying the 8th day', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', SEVENTH_DAY_AFTER_SIGNING);

    const response = await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PAYOUT_TOO_EARLY' });
    expect(JSON.stringify(response.body)).toContain(EIGHTH_DAY_AFTER_SIGNING.toISOString());
  });

  it('authorises the payout on the 8th day after the signing for an eligible customer', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    expectStatus(await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {}), 204);
  });

  it('refuses the payout of an application withdrawn before it, by its code', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, THREE_DAYS_AFTER_SIGNING);

    expectStatus(await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {}), 204);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    const response = await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {});

    expect(response.body).toMatchObject({ code: 'PAYOUT_AFTER_WITHDRAWAL' });
  });

  it('refuses the payout to a customer whose due diligence is overdue, by its code', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const compliance = await operatorOf(application, 'ada');

    expectStatus(
      await compliance.post(`/customers/${offer.applicantId}/refresh`, {
        name: 'Ada Lovelace',
        birthDate: '1990-01-01',
      }),
      201,
    );

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', OVERDUE_ON);

    const response = await clerk.post(`/applications/${offer.applicationId}/payout-authorisation`, {});

    expect(response.body).toMatchObject({ code: 'PAYOUT_NOT_ELIGIBLE' });
  });

  it('refuses the payout of an application with no signed offer, by its code', async () => {
    const { applicationId } = await submittedApplication(application);

    await analystOf(application, 'payout-clerk');
    const clerk = await onDay(application, 'payout-clerk', EIGHTH_DAY_AFTER_SIGNING);

    const response = await clerk.post(`/applications/${applicationId}/payout-authorisation`, {});

    expect(response.body).toMatchObject({ code: 'OFFER_NOT_SIGNED' });
  });
});
