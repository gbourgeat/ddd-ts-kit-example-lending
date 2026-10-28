import { jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { issuedOfferOf, type IssuedOffer } from '$test/e2e/support/credit-application/signable-offer-world';

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

/** The applicant's offer, issued and signed: the day of the signing is the one the withdrawal and the payout count from. */
export interface SignedOffer extends IssuedOffer {
  readonly applicationId: string;
}

/**
 * Issues the offer of an approved application on `issuedOn`, then the applicant signs it on `signedOn`. The clock is left on
 * the day of the signing: a spec moves it with `onDay` before each later call, a credential minted earlier is no longer valid.
 */
export async function signedOfferOn(
  application: RunningApplication,
  issuedOn: Date,
  signedOn: Date,
): Promise<SignedOffer> {
  jest.useFakeTimers({ now: issuedOn, doNotFake: [...REAL_TIMERS] });

  const offer = await issuedOfferOf(application);

  jest.setSystemTime(signedOn);

  const applicant = await application.as({ id: offer.applicantId, tenantId: 'acme-bank' });

  expectStatus(await applicant.post(`/offers/${offer.offerId}/acceptance`, {}), 204);

  return offer;
}

/** The clock moves to `instant`, and the client of `id` is signed in on that day: a credential is minted on the day it is used. */
export async function onDay(application: RunningApplication, id: string, instant: Date): Promise<HttpClient> {
  jest.setSystemTime(instant);

  return application.as({ id, tenantId: 'acme-bank' });
}
