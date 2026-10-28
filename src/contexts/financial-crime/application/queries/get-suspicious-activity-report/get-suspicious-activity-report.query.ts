import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { GetSuspiciousActivityReportResult } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.result';

/** Reads one report. A caller who may not see it is refused as the permission refuses; one that does not exist is UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT. */
export class GetSuspiciousActivityReportQuery extends AuthorizedQuery<GetSuspiciousActivityReportResult> {
  constructor(
    actor: Actor,
    readonly reportId: string,
  ) {
    super(actor);
  }
}
