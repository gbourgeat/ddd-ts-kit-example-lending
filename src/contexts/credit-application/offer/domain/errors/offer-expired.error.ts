import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class OfferExpired extends DomainRefusal {
  readonly code = CreditApplicationCodes.OfferExpired;

  /** The offer can no longer be signed: its 15 days of validity from its issue are over, and the refusal carries the expiry. */
  static forExpiry(offerId: string, expiredAt: Date) {
    return OfferExpired.refusal('The offer can no longer be signed: its validity of 15 days is over.', {
      offerId,
      expiredAt: expiredAt.toISOString(),
    }).exposing('expiredAt');
  }
}
