import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';

describe('UnknownLoan', () => {
  it('refuses for loan with the code UNKNOWN_LOAN', () => {
    const error = UnknownLoan.forLoan('loan-9');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_LOAN');
    expect(error.message).toBe('No loan has this identifier.');
    expect(error.facts).toEqual({ loanId: 'loan-9' });
  });
});
