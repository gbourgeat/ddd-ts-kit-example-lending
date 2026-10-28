import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class PayoutNotEligible extends DomainRefusal {
  readonly code = CreditApplicationCodes.PayoutNotEligible;

  /** The customer may not be lent to on the day: the refusal carries the reason due diligence gave. */
  static forIneligibility(reason: string) {
    return PayoutNotEligible.refusal('The customer is not eligible to a payout on the day.', { reason }).exposing(
      'reason',
    );
  }
}
