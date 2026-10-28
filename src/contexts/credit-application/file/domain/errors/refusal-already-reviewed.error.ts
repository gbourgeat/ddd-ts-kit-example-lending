import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class RefusalAlreadyReviewed extends DomainRefusal {
  readonly code = CreditApplicationCodes.RefusalAlreadyReviewed;

  static forApplication() {
    return RefusalAlreadyReviewed.refusal('The proposed refusal was already reviewed.');
  }
}
