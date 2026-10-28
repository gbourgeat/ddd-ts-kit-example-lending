import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class OfferNotSigned extends DomainRefusal {
  readonly code = CreditApplicationCodes.OfferNotSigned;

  /** The application has no signed offer: there is no signing to withdraw from, nor to count the payout from. */
  static forNotSigned(applicationId: string) {
    return OfferNotSigned.refusal('The application has no signed offer.', { applicationId });
  }
}
