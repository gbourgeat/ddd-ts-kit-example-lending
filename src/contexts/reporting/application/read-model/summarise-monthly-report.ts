import type { MonthlyReportItem } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import type { ApplicationCountRow } from '@/contexts/reporting/application/ports/application-counts.port';
import type { DecisionCountRow } from '@/contexts/reporting/application/read-model/decision-count.row';

/** Basis points in a whole: the share of a count, in integers. */
const BASIS_POINTS = 10_000;

/** The read models of one month, and the portfolio at risk of each branch at the time of the query. */
export interface MonthlyReportInput {
  readonly month: string;
  readonly applications: readonly ApplicationCountRow[];
  readonly decisions: readonly DecisionCountRow[];
  readonly portfolio: PortfolioAtRiskPerBranchResult['branches'];
}

/**
 * The monthly report of a month: one line per branch that brought in or decided an application in it, sorted by branch.
 * A branch with no decision has no approval rate nor exception share, and a branch the portfolio does not know holds no loan at risk.
 */
export function summariseMonthlyReport(input: MonthlyReportInput): MonthlyReportItem[] {
  const branchIds = [
    ...new Set([...input.applications.map((row) => row.branchId), ...input.decisions.map((row) => row.branchId)]),
  ].sort();

  return branchIds.map((branchId) => lineOf(branchId, input));
}

function lineOf(branchId: string, input: MonthlyReportInput): MonthlyReportItem {
  const applications = input.applications.filter((row) => row.branchId === branchId);
  const decisions = input.decisions.filter((row) => row.branchId === branchId);
  const decisionCount = sumOf(decisions, (row) => row.decisionCount);
  const approvalCount = sumOf(decisions, (row) => row.approvalCount);
  const exceptionCount = sumOf(decisions, (row) => row.exceptionCount);
  const portfolio = input.portfolio.find((line) => line.branchId === branchId);

  return {
    id: branchId,
    branchId,
    month: input.month,
    applicationCount: sumOf(applications, (row) => row.applicationCount),
    applicationAmountCents: sumOf(applications, (row) => row.amountCents),
    decisionCount,
    approvalCount,
    exceptionCount,
    approvalRateBasisPoints: shareOf(approvalCount, decisionCount),
    exceptionShareBasisPoints: shareOf(exceptionCount, decisionCount),
    portfolioAtRiskBasisPoints: portfolio?.portfolioAtRiskBasisPoints ?? 0,
  };
}

function sumOf<Row>(rows: readonly Row[], field: (row: Row) => number): number {
  return rows.reduce((total, row) => total + field(row), 0);
}

function shareOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.floor((part * BASIS_POINTS) / whole);
}
