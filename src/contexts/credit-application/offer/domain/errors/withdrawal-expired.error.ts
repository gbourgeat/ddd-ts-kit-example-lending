import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class WithdrawalExpired extends DomainRefusal {
  readonly code = CreditApplicationCodes.WithdrawalExpired;

  /** The application can no longer be withdrawn: its 14 calendar days from the signing are over, and the refusal carries the limit. */
  static forExpiry(expiredAt: Date) {
    return WithdrawalExpired.refusal('The withdrawal is no longer possible: its 14 calendar days are over.', {
      expiredAt: expiredAt.toISOString(),
    }).exposing('expiredAt');
  }
}
