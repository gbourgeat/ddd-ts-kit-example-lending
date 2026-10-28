import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ConflictedDecider extends DomainRefusal {
  readonly code = CreditApplicationCodes.ConflictedDecider;

  static forConflictedDecider() {
    return ConflictedDecider.refusal(
      'The person who declared a conflict of interest on the applicant never decides the application.',
    );
  }
}
