import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class HumanReviewNotAvailable extends DomainRefusal {
  readonly code = CreditApplicationCodes.HumanReviewNotAvailable;

  static forHumanReviewNotAvailable() {
    return HumanReviewNotAvailable.refusal(
      'A person reviews only a refusal: the refusal proposed by the assessment, or the decided refusal.',
    );
  }
}
