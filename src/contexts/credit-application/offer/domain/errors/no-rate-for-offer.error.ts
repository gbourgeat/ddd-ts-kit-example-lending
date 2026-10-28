import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NoRateForOffer extends DomainRefusal {
  readonly code = CreditApplicationCodes.NoRateForOffer;

  static forProductAndDuration(productId: string, durationMonths: number) {
    return NoRateForOffer.refusal('No rate grid in force prices this product for this duration.', {
      productId,
      durationMonths,
    }).exposing('productId', 'durationMonths');
  }
}
