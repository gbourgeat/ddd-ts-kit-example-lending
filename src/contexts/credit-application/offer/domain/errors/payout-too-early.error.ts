import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class PayoutTooEarly extends DomainRefusal {
  readonly code = CreditApplicationCodes.PayoutTooEarly;

  /** The payout cannot be authorised before its earliest day, the 8th day after the signing: the refusal carries that day. */
  static forEarlyPayout(earliestPayoutAt: Date) {
    return PayoutTooEarly.refusal('The payout cannot be authorised before the 8th day after the signing.', {
      earliestPayoutAt: earliestPayoutAt.toISOString(),
    }).exposing('earliestPayoutAt');
  }
}
