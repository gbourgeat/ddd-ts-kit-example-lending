import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class OfferAlreadyAccepted extends DomainRefusal {
  readonly code = CreditApplicationCodes.OfferAlreadyAccepted;

  /** The offer was already signed: a second signature is refused, the signing date stays the first one. */
  static forAlreadyAccepted(offerId: string) {
    return OfferAlreadyAccepted.refusal('The offer was already signed.', { offerId }).exposing('offerId');
  }
}
