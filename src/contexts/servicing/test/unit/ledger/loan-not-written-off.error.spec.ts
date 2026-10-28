import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { LoanNotWrittenOff } from '@/contexts/servicing/ledger/domain/errors/loan-not-written-off.error';

describe('LoanNotWrittenOff', () => {
  it('refuses with the code LOAN_NOT_WRITTEN_OFF', () => {
    const error = LoanNotWrittenOff.forLoan('loan-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('LOAN_NOT_WRITTEN_OFF');
  });
});
