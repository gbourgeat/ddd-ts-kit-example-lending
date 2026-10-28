import { describe, expect, it } from '@jest/globals';
import { SimpleDailyInterestService } from '@/contexts/servicing/ledger/domain/services/simple-daily-interest.service';
import { Money } from '@/shared-kernel/money.vo';

const paidOutOn = new Date('2026-03-01T00:00:00.000Z');
const principal = Money.ofCents(100_000);
const ANNUAL_RATE_BASIS_POINTS = 500;

describe('SimpleDailyInterestService', () => {
  it('accrues the interest of the whole days elapsed since the payout, on the principal only', () => {
    const interest = new SimpleDailyInterestService().of(
      principal,
      ANNUAL_RATE_BASIS_POINTS,
      paidOutOn,
      new Date('2026-03-31T00:00:00.000Z'),
    );

    expect(interest.cents).toBe(410);
  });

  it('accrues the annual rate over a year of 365 days', () => {
    const interest = new SimpleDailyInterestService().of(
      principal,
      ANNUAL_RATE_BASIS_POINTS,
      paidOutOn,
      new Date('2027-03-01T00:00:00.000Z'),
    );

    expect(interest.cents).toBe(5_000);
  });

  it('rounds the interest down to whole cents', () => {
    const interest = new SimpleDailyInterestService().of(
      principal,
      ANNUAL_RATE_BASIS_POINTS,
      paidOutOn,
      new Date('2026-03-02T00:00:00.000Z'),
    );

    expect(interest.cents).toBe(13);
  });

  it('accrues no interest on the instant of the payout itself', () => {
    const interest = new SimpleDailyInterestService().of(principal, ANNUAL_RATE_BASIS_POINTS, paidOutOn, paidOutOn);

    expect(interest.cents).toBe(0);
  });
});
