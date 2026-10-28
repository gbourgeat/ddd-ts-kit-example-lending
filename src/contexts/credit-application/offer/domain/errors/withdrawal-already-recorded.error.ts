import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class WithdrawalAlreadyRecorded extends DomainRefusal {
  readonly code = CreditApplicationCodes.WithdrawalAlreadyRecorded;

  /** The application was already withdrawn: a withdrawal is recorded once only. */
  static forAlreadyWithdrawn(applicationId: string) {
    return WithdrawalAlreadyRecorded.refusal('The application was already withdrawn.', { applicationId });
  }
}
