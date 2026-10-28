import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownOffer extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownOffer;

  static forOffer(offerId: string) {
    return UnknownOffer.refusal('No offer has this identifier.', { offerId }).exposing('offerId');
  }
}
