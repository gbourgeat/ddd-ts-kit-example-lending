import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class PayoutAfterWithdrawal extends DomainRefusal {
  readonly code = CreditApplicationCodes.PayoutAfterWithdrawal;

  /** The application was withdrawn: no money is paid out for it. */
  static forWithdrawal(applicationId: string) {
    return PayoutAfterWithdrawal.refusal('The application was withdrawn: no payout is authorised.', { applicationId });
  }
}
