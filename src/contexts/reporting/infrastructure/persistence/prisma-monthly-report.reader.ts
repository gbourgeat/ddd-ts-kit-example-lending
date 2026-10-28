import type { AccessScope } from '@ddd-ts-kit/auth';
import type { ExecutionScope, PageRequest } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { MonthlyReportReader } from '@/contexts/reporting/application/ports/monthly-report-reader.port';
import type { PortfolioAtRiskPerBranchReader } from '@/contexts/reporting/application/ports/portfolio-at-risk-per-branch-reader.port';
import type {
  MonthlyReportResult,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import { monthlyReportPage } from '@/contexts/reporting/application/read-model/monthly-report-page';
import { summariseMonthlyReport } from '@/contexts/reporting/application/read-model/summarise-monthly-report';
import type { Database } from '@/platform/database/database';

/** Reads the month of the tenant from the applications and decisions per branch, and joins the portfolio at risk of each branch. */
export class PrismaMonthlyReportReader implements MonthlyReportReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly portfolio: PortfolioAtRiskPerBranchReader,
  ) {}

  async search(access: AccessScope, month: string, page: PageRequest<MonthlyReportSort>): Promise<MonthlyReportResult> {
    const applications = await this.database.client().reportingApplicationCount.findMany({
      where: { ...tenantWhere(this.scope), month },
    });

    const decisions = await this.database.client().reportingDecisionCount.findMany({
      where: { ...tenantWhere(this.scope), month },
    });

    const { branches } = await this.portfolio.read();

    return monthlyReportPage(
      summariseMonthlyReport({
        month,
        // The amount is a BigInt column: cents of a branch in a month fit a number, the rest of the report counts in numbers.
        applications: applications.map((row) => ({ ...row, amountCents: Number(row.amountCents) })),
        decisions,
        portfolio: branches,
      }),
      access,
      page,
    );
  }
}
