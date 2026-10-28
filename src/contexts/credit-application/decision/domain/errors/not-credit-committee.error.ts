import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NotCreditCommittee extends DomainRefusal {
  readonly code = CreditApplicationCodes.NotCreditCommittee;

  static forNotCreditCommittee(deciderLevel: string) {
    return NotCreditCommittee.refusal('Only the credit committee decides an exception to the policy.', {
      deciderLevel,
    }).exposing('deciderLevel');
  }
}
