import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type { MonthlyReportReader } from '@/contexts/reporting/application/ports/monthly-report-reader.port';
import type {
  MonthlyReportItem,
  MonthlyReportResult,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import { monthlyReportPage } from '@/contexts/reporting/application/read-model/monthly-report-page';

/** The monthly report held in the memory of a test: a working reader of the port, with the lines it is given. */
export class FakeMonthlyReportReader implements MonthlyReportReader {
  constructor(private readonly monthlyReports: readonly MonthlyReportItem[]) {}

  async search(scope: AccessScope, month: string, page: PageRequest<MonthlyReportSort>): Promise<MonthlyReportResult> {
    return monthlyReportPage(
      this.monthlyReports.filter((line) => line.month === month),
      scope,
      page,
    );
  }
}
