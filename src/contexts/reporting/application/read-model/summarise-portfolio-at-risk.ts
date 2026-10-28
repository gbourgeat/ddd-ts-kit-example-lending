import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';
import type { PortfolioAtRiskRow } from '@/contexts/reporting/application/read-model/portfolio-at-risk.row';

/** The buckets at risk: 31 days past due and over. */
const AT_RISK_BUCKETS = ['ThirtyOneToSixtyDays', 'SixtyOneToNinetyDays', 'OverNinetyDays'] as const;

/** Basis points in a whole: the share of a portfolio, in integers. */
const BASIS_POINTS = 10_000;

/**
 * The portfolio at risk of each branch. A loan counts in the branch it was paid out on, and in the bucket it entered last;
 * a loan with no arrears event is performing, and a loan whose payout is not known yet is counted nowhere.
 */
export function summarisePortfolioAtRisk(
  principals: readonly LoanPrincipalRow[],
  arrears: readonly PortfolioAtRiskRow[],
): PortfolioAtRiskPerBranchResult {
  const bucketOf = new Map(arrears.map((row) => [`${row.tenantId}:${row.loanId}`, row.bucket]));
  const branchIds = [...new Set(principals.map((loan) => loan.branchId))].sort();

  return {
    branches: branchIds.map((branchId) => {
      const loans = principals.filter((loan) => loan.branchId === branchId);

      return branchSummary(branchId, loans, bucketOf);
    }),
  };
}

function branchSummary(branchId: string, loans: readonly LoanPrincipalRow[], bucketOf: ReadonlyMap<string, string>) {
  const paidOutCents = sumOf(loans);
  const atRiskCents = AT_RISK_BUCKETS.reduce((total, bucket) => total + sumInBucket(loans, bucketOf, bucket), 0);

  return {
    branchId,
    paidOutCents,
    oneToThirtyDaysCents: sumInBucket(loans, bucketOf, 'OneToThirtyDays'),
    thirtyOneToSixtyDaysCents: sumInBucket(loans, bucketOf, 'ThirtyOneToSixtyDays'),
    sixtyOneToNinetyDaysCents: sumInBucket(loans, bucketOf, 'SixtyOneToNinetyDays'),
    overNinetyDaysCents: sumInBucket(loans, bucketOf, 'OverNinetyDays'),
    atRiskCents,
    portfolioAtRiskBasisPoints: paidOutCents === 0 ? 0 : Math.floor((atRiskCents * BASIS_POINTS) / paidOutCents),
  };
}

function sumOf(loans: readonly LoanPrincipalRow[]): number {
  return loans.reduce((total, loan) => total + loan.principalCents, 0);
}

function sumInBucket(
  loans: readonly LoanPrincipalRow[],
  bucketOf: ReadonlyMap<string, string>,
  bucket: string,
): number {
  const inBucket = loans.filter((loan) => bucketOf.get(`${loan.tenantId}:${loan.loanId}`) === bucket);

  return sumOf(inBucket);
}
