import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class OfferAboveLegalMaximum extends DomainRefusal {
  readonly code = CreditApplicationCodes.OfferAboveLegalMaximum;

  static forAboveLegalMaximum(annualPercentageRateTenths: number, legalMaximumBasisPoints: number) {
    return OfferAboveLegalMaximum.refusal(
      'The annual percentage rate of the offer is above the legal maximum rate in force.',
      { annualPercentageRateTenths, legalMaximumBasisPoints },
    ).exposing('annualPercentageRateTenths', 'legalMaximumBasisPoints');
  }
}
