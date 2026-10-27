import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BusinessNotRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-not-registered.error';

describe('BusinessNotRegistered', () => {
  it('refuses for customer with the code BUSINESS_NOT_REGISTERED', () => {
    const error = BusinessNotRegistered.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('BUSINESS_NOT_REGISTERED');

    expect(error.message).toBe(
      'The business is not registered yet: its directors and beneficial owners are identified after its registration.',
    );

    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
