import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { LoanAlreadyClosed } from '@/contexts/servicing/ledger/domain/errors/loan-already-closed.error';

describe('LoanAlreadyClosed', () => {
  it('refuses for loan with the code LOAN_ALREADY_CLOSED', () => {
    const error = LoanAlreadyClosed.forLoan('loan-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('LOAN_ALREADY_CLOSED');
    expect(error.message).toBe('The loan is already closed: its ledger is closed once.');
    expect(error.facts).toEqual({ loanId: 'loan-1' });
  });
});
