import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidReviewReason extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidReviewReason;

  static forReason() {
    return InvalidReviewReason.refusal('A review needs a written reason.');
  }
}
