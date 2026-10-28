import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownLegalMaximumRate extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownLegalMaximumRate;

  static forUnknownLegalMaximumRate() {
    return UnknownLegalMaximumRate.refusal('Unknown legal maximum rate.');
  }
}
