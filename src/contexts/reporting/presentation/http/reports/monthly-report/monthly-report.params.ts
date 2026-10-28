import type { PageRequest } from '@ddd-ts-kit/kernel';
import type { MonthlyReportSort } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';

/** What the monthly report route reads from its query: the month to report, and the page of its branches. */
export interface MonthlyReportParams {
  readonly month: string;
  readonly page: PageRequest<MonthlyReportSort>;
}
