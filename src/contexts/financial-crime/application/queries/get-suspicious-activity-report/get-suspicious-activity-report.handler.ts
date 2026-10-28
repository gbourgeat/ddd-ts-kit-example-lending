import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import type { GetSuspiciousActivityReportReader } from '@/contexts/financial-crime/application/ports/get-suspicious-activity-report-reader.port';
import type { GetSuspiciousActivityReportQuery } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.query';
import type { GetSuspiciousActivityReportResult } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.result';
import { UnknownSuspiciousActivityReport } from '@/contexts/financial-crime/domain/errors/unknown-suspicious-activity-report.error';

export class GetSuspiciousActivityReportHandler implements QueryHandler<GetSuspiciousActivityReportQuery> {
  constructor(
    private readonly reader: GetSuspiciousActivityReportReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetSuspiciousActivityReportQuery): Promise<GetSuspiciousActivityReportResult> {
    const scope = await this.access.scope(query.actor, financialCrimePermissions['report.read'], 'context');
    const report = await this.reader.read(this.visibleTo(scope), query.reportId);

    if (report === undefined) {
      throw UnknownSuspiciousActivityReport.forReport();
    }

    return report;
  }

  /** Reports are the compliance group's: the operators of financial-crime see them, any other caller sees none. */
  private visibleTo(scope: AccessScope): AccessScope {
    return scope.kind === 'all' || (scope.kind === 'ids' && scope.ids.includes('financial-crime'))
      ? { kind: 'all' }
      : { kind: 'none' };
  }
}
