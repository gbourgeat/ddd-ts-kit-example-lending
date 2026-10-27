import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';

describe('UnknownCustomer', () => {
  it('refuses for customer with the code UNKNOWN_CUSTOMER', () => {
    const error = UnknownCustomer.forCustomer('customer-5');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_CUSTOMER');
    expect(error.message).toBe('No customer is known under this identifier.');
    expect(error.facts).toEqual({ customerId: 'customer-5' });
  });
});
