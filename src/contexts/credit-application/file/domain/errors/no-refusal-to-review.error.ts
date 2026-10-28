import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NoRefusalToReview extends DomainRefusal {
  readonly code = CreditApplicationCodes.NoRefusalToReview;

  static forApplication() {
    return NoRefusalToReview.refusal(
      'No refusal to review: the application was not assessed, or its last assessment proposed no refusal.',
    );
  }
}
