import { describe, expect, it } from '@jest/globals';
import { summarisePortfolioAtRisk } from '@/contexts/servicing/arrears/application/read-model/summarise-portfolio-at-risk';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

describe('Summarise the portfolio at risk', () => {
  it('counts the open loans and their principal in each bucket, empty buckets included', () => {
    const summary = summarisePortfolioAtRisk([
      { principalCents: 100_000, bucket: ArrearsBucket.None },
      { principalCents: 50_000, bucket: ArrearsBucket.OneToThirtyDays },
      { principalCents: 25_000, bucket: ArrearsBucket.None },
    ]);

    expect(summary.buckets).toEqual([
      { bucket: ArrearsBucket.None, loans: 2, principalCents: 125_000 },
      { bucket: ArrearsBucket.OneToThirtyDays, loans: 1, principalCents: 50_000 },
      { bucket: ArrearsBucket.ThirtyOneToSixtyDays, loans: 0, principalCents: 0 },
      { bucket: ArrearsBucket.SixtyOneToNinetyDays, loans: 0, principalCents: 0 },
      { bucket: ArrearsBucket.OverNinetyDays, loans: 0, principalCents: 0 },
    ]);

    expect(summary.openPrincipalCents).toBe(175_000);
  });

  it('takes the loans 31 days past due and over as the portfolio at risk, in basis points', () => {
    const summary = summarisePortfolioAtRisk([
      { principalCents: 100_000, bucket: ArrearsBucket.None },
      { principalCents: 100_000, bucket: ArrearsBucket.OneToThirtyDays },
      { principalCents: 200_000, bucket: ArrearsBucket.ThirtyOneToSixtyDays },
    ]);

    expect(summary.atRiskBasisPoints).toBe(5000);
  });

  it('rounds the share at risk down, with integer maths', () => {
    const summary = summarisePortfolioAtRisk([
      { principalCents: 1, bucket: ArrearsBucket.OverNinetyDays },
      { principalCents: 2, bucket: ArrearsBucket.None },
    ]);

    expect(summary.atRiskBasisPoints).toBe(3333);
  });

  it('answers zero basis points when no loan is open', () => {
    expect(summarisePortfolioAtRisk([]).atRiskBasisPoints).toBe(0);
  });
});
