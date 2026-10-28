import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';
import { issuedOfferOf, type IssuedOffer } from '$test/e2e/support/credit-application/signable-offer-world';

/** The offer is issued on this morning: its fifteen days of validity count from it. */
const ISSUED_ON = new Date('2026-04-01T09:00:00.000Z');
const FOURTEEN_DAYS_AFTER = new Date('2026-04-15T09:00:00.000Z');
const FIFTEEN_DAYS_AFTER = new Date('2026-04-16T09:00:00.000Z');
const SIXTEEN_DAYS_AFTER = new Date('2026-04-17T09:00:00.000Z');

const REAL_TIMERS = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'nextTick',
  'queueMicrotask',
] as const;

describe('Accept the offer by electronic signature within 15 days, end to end', () => {
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
    expectStatus(await application.client.post('/offers/offer-1/acceptance', {}), 401);
  });

  it('answers 403 to a stranger who is not the applicant of the offer', async () => {
    const offer = await issuedOffer();
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post(`/offers/${offer.offerId}/acceptance`, {}), 403);
  });

  it('accepts the signature of the applicant within the fifteen days of the offer', async () => {
    const offer = await issuedOffer();
    const signer = await signingOn(offer, FOURTEEN_DAYS_AFTER);

    expectStatus(await signer.post(`/offers/${offer.offerId}/acceptance`, {}), 204);
  });

  it('accepts the signature on the fifteenth day after the issue, the last day of its validity', async () => {
    const offer = await issuedOffer();
    const signer = await signingOn(offer, FIFTEEN_DAYS_AFTER);

    expectStatus(await signer.post(`/offers/${offer.offerId}/acceptance`, {}), 204);
  });

  it('refuses the signature after the fifteen days of the offer, by its code', async () => {
    const offer = await issuedOffer();
    const signer = await signingOn(offer, SIXTEEN_DAYS_AFTER);

    const response = await signer.post(`/offers/${offer.offerId}/acceptance`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'OFFER_EXPIRED' });
  });

  it('refuses a second signature of the same offer, by its code', async () => {
    const offer = await issuedOffer();
    const signer = await signingOn(offer, FOURTEEN_DAYS_AFTER);

    expectStatus(await signer.post(`/offers/${offer.offerId}/acceptance`, {}), 204);

    const second = await signer.post(`/offers/${offer.offerId}/acceptance`, {});

    expect(second.body).toMatchObject({ code: 'OFFER_ALREADY_ACCEPTED' });
  });

  /** The offer issued on ISSUED_ON: the clock is held there until the spec moves it to the day of its signature. */
  async function issuedOffer(): Promise<IssuedOffer> {
    jest.useFakeTimers({ now: ISSUED_ON, doNotFake: [...REAL_TIMERS] });

    return issuedOfferOf(application);
  }

  /** The applicant's client on the day of the signature: a credential minted before the clock moved is no longer valid. */
  async function signingOn(offer: IssuedOffer, instant: Date): Promise<HttpClient> {
    jest.setSystemTime(instant);

    return application.as({ id: offer.applicantId, tenantId: 'acme-bank' });
  }
});
