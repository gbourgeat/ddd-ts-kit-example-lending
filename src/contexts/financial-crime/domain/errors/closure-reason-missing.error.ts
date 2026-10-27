import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';

export class ClosureReasonMissing extends DomainRefusal {
  readonly code = FinancialCrimeCodes.ClosureReasonMissing;

  static forAlert() {
    return ClosureReasonMissing.refusal('Closure reason missing.');
  }
}
