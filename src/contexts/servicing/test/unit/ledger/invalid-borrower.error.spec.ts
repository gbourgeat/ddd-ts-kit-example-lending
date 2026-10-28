import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidBorrower } from '@/contexts/servicing/ledger/domain/errors/invalid-borrower.error';

describe('InvalidBorrower', () => {
  it('refuses for name with the code INVALID_BORROWER', () => {
    const error = InvalidBorrower.forName();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_BORROWER');
    expect(error.message).toBe('The borrower of a loan must have a name.');
    expect(error.facts).toEqual({});
  });
});
