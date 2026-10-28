import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnidentifiedParty } from '@/contexts/credit-application/assessment/domain/errors/unidentified-party.error';

describe('UnidentifiedParty', () => {
  it('refuses for customer with the code UNIDENTIFIED_PARTY', () => {
    const error = UnidentifiedParty.forCustomer('customer-2');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNIDENTIFIED_PARTY');
  });
});
