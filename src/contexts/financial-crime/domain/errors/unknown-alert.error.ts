import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';

export class UnknownAlert extends DomainRefusal {
  readonly code = FinancialCrimeCodes.UnknownAlert;

  static forAlert() {
    return UnknownAlert.refusal('Unknown alert.');
  }
}
