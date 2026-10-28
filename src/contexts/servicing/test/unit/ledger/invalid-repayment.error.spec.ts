import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidRepayment } from '@/contexts/servicing/ledger/domain/errors/invalid-repayment.error';

describe('InvalidRepayment', () => {
  it('refuses with the code INVALID_REPAYMENT', () => {
    const error = InvalidRepayment.forAmount(-5);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_REPAYMENT');
  });
});
