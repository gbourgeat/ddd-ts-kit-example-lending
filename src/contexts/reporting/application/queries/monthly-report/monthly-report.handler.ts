import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { Actor, QueryHandler } from '@ddd-ts-kit/kernel';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import type { MonthlyReportReader } from '@/contexts/reporting/application/ports/monthly-report-reader.port';
import type { MonthlyReportQuery } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.query';
import type { MonthlyReportResult } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';

const CONTEXT = 'reporting';

export class MonthlyReportHandler implements QueryHandler<MonthlyReportQuery> {
  constructor(
    private readonly reader: MonthlyReportReader,
    private readonly access: Access,
  ) {}

  async execute(query: MonthlyReportQuery): Promise<MonthlyReportResult> {
    const scope = await this.readableScope(query.actor);

    return this.reader.search(scope, query.month, query.page);
  }

  /** The report is the context itself: an operator of reporting reads every branch, any other actor reads none. */
  private async readableScope(actor: Actor): Promise<AccessScope> {
    const onContext = await this.access.scope(actor, reportingPermissions['report.monthly'], 'context');

    if (onContext.kind === 'all' || (onContext.kind === 'ids' && onContext.ids.includes(CONTEXT))) {
      return { kind: 'all' };
    }

    return { kind: 'none' };
  }
}
