import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ReviewerCannotBeAssessor extends DomainRefusal {
  readonly code = CreditApplicationCodes.ReviewerCannotBeAssessor;

  static forApplication() {
    return ReviewerCannotBeAssessor.refusal('The reviewer cannot be the person who ran the assessment.');
  }
}
