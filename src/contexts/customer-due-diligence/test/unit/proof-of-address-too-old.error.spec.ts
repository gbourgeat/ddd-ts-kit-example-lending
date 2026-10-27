import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ProofOfAddressTooOld } from '@/contexts/customer-due-diligence/domain/errors/proof-of-address-too-old.error';

describe('ProofOfAddressTooOld', () => {
  it('refuses for customer with the code PROOF_OF_ADDRESS_TOO_OLD', () => {
    const error = ProofOfAddressTooOld.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PROOF_OF_ADDRESS_TOO_OLD');
    expect(error.message).toBe('The proof of address is dated more than three months ago.');
    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
