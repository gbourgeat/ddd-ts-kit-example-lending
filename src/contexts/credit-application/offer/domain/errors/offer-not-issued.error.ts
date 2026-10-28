import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class OfferNotIssued extends DomainRefusal {
  readonly code = CreditApplicationCodes.OfferNotIssued;

  /** The offer was drafted but not yet issued to the borrower: it cannot be signed. */
  static forNotIssued(offerId: string) {
    return OfferNotIssued.refusal('The offer has not been issued to the borrower yet.', { offerId }).exposing(
      'offerId',
    );
  }
}
