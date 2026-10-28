import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { EarlyRepaymentTooHigh } from '@/contexts/servicing/ledger/domain/errors/early-repayment-too-high.error';

describe('EarlyRepaymentTooHigh', () => {
  it('refuses with the code EARLY_REPAYMENT_TOO_HIGH', () => {
    const error = EarlyRepaymentTooHigh.forRepayment(100_001, 100_000);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EARLY_REPAYMENT_TOO_HIGH');
  });
});
