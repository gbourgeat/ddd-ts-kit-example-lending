import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class RefusalNotReviewed extends DomainRefusal {
  readonly code = CreditApplicationCodes.RefusalNotReviewed;

  static forApplication() {
    return RefusalNotReviewed.refusal(
      'The proposed refusal was not reviewed: a person reviews it before the application is decided.',
    );
  }
}
