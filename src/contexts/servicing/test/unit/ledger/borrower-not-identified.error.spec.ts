import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BorrowerNotIdentified } from '@/contexts/servicing/ledger/domain/errors/borrower-not-identified.error';

describe('BorrowerNotIdentified', () => {
  it('refuses a payout whose customer is not identified, with the code BORROWER_NOT_IDENTIFIED', () => {
    const error = BorrowerNotIdentified.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('BORROWER_NOT_IDENTIFIED');
  });
});
