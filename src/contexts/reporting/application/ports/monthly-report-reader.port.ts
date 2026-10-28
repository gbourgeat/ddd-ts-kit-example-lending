import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  MonthlyReportResult,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';

/** The monthly report of a month, read from the read models of the context, one page at a time. */
export abstract class MonthlyReportReader {
  abstract search(
    scope: AccessScope,
    month: string,
    page: PageRequest<MonthlyReportSort>,
  ): Promise<MonthlyReportResult>;
}
