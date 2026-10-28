import { beforeEach, describe, expect, it } from '@jest/globals';
import { FakePortfolioAtRisk } from '@/contexts/servicing/test/fakes/portfolio-at-risk.fake';
import { PortfolioAtRiskProjection } from '@/contexts/servicing/arrears/application/projections/portfolio-at-risk.projection';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const LATER = new Date('2026-02-20T00:00:00.000Z');
const LATEST = new Date('2026-03-22T00:00:00.000Z');

describe('The portfolio at risk projection', () => {
  let portfolio: FakePortfolioAtRisk;
  let projection: PortfolioAtRiskProjection;

  beforeEach(() => {
    portfolio = new FakePortfolioAtRisk();
    projection = new PortfolioAtRiskProjection(portfolio);
  });

  it('keeps a paid out loan with the principal of its schedule, in no arrears bucket', async () => {
    await projection.scheduled(scheduled('loan-1', 400_000));

    expect(await portfolio.get('loan-1')).toEqual({
      loanId: 'loan-1',
      principalCents: 400_000,
      bucket: ArrearsBucket.None,
      open: true,
    });
  });

  it('replaces the arrears bucket of the loan by the bucket it entered', async () => {
    await projection.scheduled(scheduled('loan-1', 400_000));

    await projection.bucketEntered(new LoanArrearsBucketEntered('loan-1', LATER, ArrearsBucket.OneToThirtyDays));
    await projection.bucketEntered(new LoanArrearsBucketEntered('loan-1', LATEST, ArrearsBucket.ThirtyOneToSixtyDays));

    expect(await portfolio.get('loan-1')).toMatchObject({ bucket: ArrearsBucket.ThirtyOneToSixtyDays, open: true });
  });

  it('takes a closed loan out of the portfolio, keeping its principal', async () => {
    await projection.scheduled(scheduled('loan-1', 400_000));

    await projection.closed(new LoanClosed('loan-1', LATER));

    expect(await portfolio.get('loan-1')).toMatchObject({ principalCents: 400_000, open: false });
  });

  it('writes nothing for a loan that was never scheduled', async () => {
    await projection.bucketEntered(new LoanArrearsBucketEntered('loan-404', LATER, ArrearsBucket.OverNinetyDays));

    expect(await portfolio.get('loan-404')).toBeUndefined();
  });
});

function scheduled(loanId: string, principalCents: number): LoanScheduled {
  return new LoanScheduled(loanId, PAID_OUT_ON, LoanSchedule.of(Money.ofCents(principalCents), 500, 12));
}
