import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ReportingCodes } from '@/contexts/reporting/reporting.codes';

export class ApplicationCount extends DomainRefusal {
  readonly code = ReportingCodes.ApplicationCount;

  static forSubmissionWithoutTenant(creditApplicationId: string) {
    return ApplicationCount.refusal('A submission without its tenant cannot be counted.', { creditApplicationId });
  }
}
