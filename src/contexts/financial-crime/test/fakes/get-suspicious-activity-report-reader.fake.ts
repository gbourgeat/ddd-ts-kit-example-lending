import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetSuspiciousActivityReportReader } from '@/contexts/financial-crime/application/ports/get-suspicious-activity-report-reader.port';
import type { GetSuspiciousActivityReportResult } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.result';

/** A working read model of the reports it holds, shown to the scope of all only. */
export class FakeGetSuspiciousActivityReportReader implements GetSuspiciousActivityReportReader {
  constructor(private readonly reports: readonly string[] = []) {}

  async read(scope: AccessScope, reportId: string): Promise<GetSuspiciousActivityReportResult | undefined> {
    const found = scope.kind === 'all' && this.reports.includes(reportId);

    return found ? { id: reportId } : undefined;
  }
}
