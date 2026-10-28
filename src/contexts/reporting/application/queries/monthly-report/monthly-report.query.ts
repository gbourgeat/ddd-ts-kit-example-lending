import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  MonthlyReportResult,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';

/** One page of the monthly report of a month, one line per branch, narrowed to what the actor's access scope covers. */
export class MonthlyReportQuery extends AuthorizedQuery<MonthlyReportResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<MonthlyReportSort>,
    /** The month reported, `YYYY-MM`. */
    readonly month: string,
  ) {
    super(actor);
  }
}
