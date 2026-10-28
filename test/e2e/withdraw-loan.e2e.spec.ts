import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';
import { submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import { onDay, signedOfferOn } from '$test/e2e/support/credit-application/signed-offer-world';

/** The offer is issued on this morning, and signed the day after: the 14 calendar days of withdrawal count from the signing. */
const ISSUED_ON = new Date('2026-04-01T09:00:00.000Z');
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const THREE_DAYS_AFTER_SIGNING = new Date('2026-04-05T09:00:00.000Z');
const FOURTEENTH_DAY_AFTER_SIGNING = new Date('2026-04-16T09:00:00.000Z');
const ONE_MILLISECOND_AFTER_FOURTEENTH_DAY = new Date('2026-04-16T09:00:00.001Z');

describe('Withdraw the loan within 14 calendar days of signing, without a reason, end to end', () => {
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
    expectStatus(await application.client.post('/applications/application-1/withdrawal', {}), 401);
  });

  it('answers 403 to a stranger who is not the applicant of the application', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post(`/applications/${offer.applicationId}/withdrawal`, {}), 403);
  });

  it('accepts the withdrawal of the applicant three days after the signing, without a reason', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, THREE_DAYS_AFTER_SIGNING);

    expectStatus(await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {}), 204);
  });

  it('accepts the withdrawal on the 14th day after the signing, the last day of the limit', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, FOURTEENTH_DAY_AFTER_SIGNING);

    expectStatus(await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {}), 204);
  });

  it('refuses the withdrawal one millisecond after the 14th day, by its code, carrying the limit', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, ONE_MILLISECOND_AFTER_FOURTEENTH_DAY);

    const response = await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'WITHDRAWAL_EXPIRED' });
    expect(JSON.stringify(response.body)).toContain(FOURTEENTH_DAY_AFTER_SIGNING.toISOString());
  });

  it('refuses a second withdrawal of the same application, by its code', async () => {
    const offer = await signedOfferOn(application, ISSUED_ON, SIGNED_ON);
    const applicant = await onDay(application, offer.applicantId, THREE_DAYS_AFTER_SIGNING);

    expectStatus(await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {}), 204);

    const second = await applicant.post(`/applications/${offer.applicationId}/withdrawal`, {});

    expect(second.body).toMatchObject({ code: 'WITHDRAWAL_ALREADY_RECORDED' });
  });

  it('refuses the withdrawal of an application that has no signed offer, by its code', async () => {
    const { applicationId, applicant } = await submittedApplication(application);

    const response = await applicant.post(`/applications/${applicationId}/withdrawal`, {});

    expect(response.body).toMatchObject({ code: 'OFFER_NOT_SIGNED' });
  });
});
