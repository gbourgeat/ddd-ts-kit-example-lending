import type { AccessScope } from '@ddd-ts-kit/auth';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { GetSuspiciousActivityReportReader } from '@/contexts/financial-crime/application/ports/get-suspicious-activity-report-reader.port';
import type { GetSuspiciousActivityReportResult } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.result';
import type { Database } from '@/platform/database/database';

/** Reads one report in the tenant of the work; a scope that is not all finds nothing. */
export class PrismaGetSuspiciousActivityReportReader implements GetSuspiciousActivityReportReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async read(scope: AccessScope, reportId: string): Promise<GetSuspiciousActivityReportResult | undefined> {
    if (scope.kind !== 'all') {
      return undefined;
    }

    const row = await this.database.client().financialCrimeSuspiciousActivityReport.findFirst({
      where: { id: reportId, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : { id: row.id };
  }
}
