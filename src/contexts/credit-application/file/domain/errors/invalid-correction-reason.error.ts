import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidCorrectionReason extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidCorrectionReason;

  static forReason() {
    return InvalidCorrectionReason.refusal('A correction must say why it corrects the entry.');
  }
}
