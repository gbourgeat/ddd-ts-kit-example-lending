import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';

export class AlertAlreadyClosed extends DomainRefusal {
  readonly code = FinancialCrimeCodes.AlertAlreadyClosed;

  static forAlert() {
    return AlertAlreadyClosed.refusal('Alert already closed.');
  }
}
