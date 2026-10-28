import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetSuspiciousActivityReportResult } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.result';

export abstract class GetSuspiciousActivityReportReader {
  abstract read(scope: AccessScope, reportId: string): Promise<GetSuspiciousActivityReportResult | undefined>;
}
