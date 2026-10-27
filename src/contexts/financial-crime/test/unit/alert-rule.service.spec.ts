import { describe, expect, it } from '@jest/globals';
import { AlertRuleService } from '@/contexts/financial-crime/domain/services/alert-rule.service';

const PAYOUT_AT = new Date('2026-01-01T00:00:00.000Z');
const BORROWER_ACCOUNT = 'borrower-account';
const EARLY_REPAYMENT_THRESHOLD_CENTS = 1_000_000;

describe('AlertRuleService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new AlertRuleService())).toEqual([]);
  });

  it('raises an alert when the early repayments within a year of the payout pass 10,000', () => {
    const decision = new AlertRuleService().evaluate(
      aRepayment({ amountCents: 200_000, earlyRepaidWithinYearCents: EARLY_REPAYMENT_THRESHOLD_CENTS - 100_000 }),
    );

    expect(decision).toEqual({ raised: true, reason: 'early-repayment-above-threshold' });
  });

  it('raises no alert when the early repayments within a year of the payout stay at 10,000', () => {
    const decision = new AlertRuleService().evaluate(
      aRepayment({ amountCents: 100_000, earlyRepaidWithinYearCents: EARLY_REPAYMENT_THRESHOLD_CENTS - 100_000 }),
    );

    expect(decision).toEqual({ raised: false });
  });

  it('does not count an early repayment made after a year from the payout', () => {
    const decision = new AlertRuleService().evaluate(
      aRepayment({
        amountCents: 2_000_000,
        paidAt: new Date('2027-01-02T00:00:00.000Z'),
      }),
    );

    expect(decision).toEqual({ raised: false });
  });

  it('raises no alert on a repayment that is not early, however large', () => {
    const decision = new AlertRuleService().evaluate(aRepayment({ amountCents: 2_000_000, early: false }));

    expect(decision).toEqual({ raised: false });
  });

  it("raises an alert on a payment from an account that is not the borrower's", () => {
    const decision = new AlertRuleService().evaluate(aRepayment({ payerAccount: 'stranger-account' }));

    expect(decision).toEqual({ raised: true, reason: 'payment-from-another-account' });
  });

  it("raises no alert on a payment from one of the borrower's accounts", () => {
    const decision = new AlertRuleService().evaluate(
      aRepayment({ payerAccount: 'second-account', borrowerAccounts: [BORROWER_ACCOUNT, 'second-account'] }),
    );

    expect(decision).toEqual({ raised: false });
  });

  it('gives the early repayment reason when both rules are broken', () => {
    const decision = new AlertRuleService().evaluate(
      aRepayment({ amountCents: 2_000_000, payerAccount: 'stranger-account' }),
    );

    expect(decision).toEqual({ raised: true, reason: 'early-repayment-above-threshold' });
  });
});

type Facts = Parameters<AlertRuleService['evaluate']>[0];

function aRepayment(overrides: Partial<Facts> = {}): Facts {
  return {
    amountCents: 100_000,
    early: true,
    paidAt: new Date('2026-06-01T00:00:00.000Z'),
    payoutAt: PAYOUT_AT,
    earlyRepaidWithinYearCents: 0,
    payerAccount: BORROWER_ACCOUNT,
    borrowerAccounts: [BORROWER_ACCOUNT],
    ...overrides,
  };
}
