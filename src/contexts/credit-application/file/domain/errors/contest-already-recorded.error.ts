import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ContestAlreadyRecorded extends DomainRefusal {
  readonly code = CreditApplicationCodes.ContestAlreadyRecorded;

  static forContestAlreadyRecorded() {
    return ContestAlreadyRecorded.refusal(
      'The applicant already contested the decision: a decision is contested once.',
    );
  }
}
