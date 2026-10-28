import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

/** The buckets whose loans are at risk: 31 days past due and over. */
const AT_RISK_BUCKETS: readonly string[] = [
  ArrearsBucket.ThirtyOneToSixtyDays,
  ArrearsBucket.SixtyOneToNinetyDays,
  ArrearsBucket.OverNinetyDays,
];

const BASIS_POINTS_IN_WHOLE = 10_000;

/** An open loan of the portfolio: the principal of its schedule and the bucket it is in. */
type OpenLoan = { readonly principalCents: number; readonly bucket: string };

/** Summarises the open loans of the tenant: one line per bucket, the total principal and the share at risk in basis points. */
export function summarisePortfolioAtRisk(loans: readonly OpenLoan[]): ReadPortfolioAtRiskResult {
  const openPrincipalCents = sumOf(loans);
  const atRisk = loans.filter((loan) => AT_RISK_BUCKETS.includes(loan.bucket));

  return {
    buckets: Object.values(ArrearsBucket).map((bucket) => bucketLine(bucket, loans)),
    openPrincipalCents,
    atRiskBasisPoints: basisPointsOf(sumOf(atRisk), openPrincipalCents),
  };
}

function bucketLine(bucket: string, loans: readonly OpenLoan[]) {
  const inBucket = loans.filter((loan) => loan.bucket === bucket);

  return { bucket, loans: inBucket.length, principalCents: sumOf(inBucket) };
}

function sumOf(loans: readonly OpenLoan[]): number {
  return loans.reduce((total, loan) => total + loan.principalCents, 0);
}

/** The share of `part` in `whole`, in basis points, rounded down with integer maths; zero when `whole` is zero. */
function basisPointsOf(part: number, whole: number): number {
  if (whole === 0) {
    return 0;
  }

  return Number((BigInt(part) * BigInt(BASIS_POINTS_IN_WHOLE)) / BigInt(whole));
}
