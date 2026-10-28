import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';

export class UnknownSuspiciousActivityReport extends DomainRefusal {
  readonly code = FinancialCrimeCodes.UnknownSuspiciousActivityReport;

  static forReport() {
    return UnknownSuspiciousActivityReport.refusal('Unknown suspicious activity report.');
  }
}
