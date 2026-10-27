import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BusinessAlreadyRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-already-registered.error';

describe('BusinessAlreadyRegistered', () => {
  it('refuses for customer with the code BUSINESS_ALREADY_REGISTERED', () => {
    const error = BusinessAlreadyRegistered.forCustomer('customer-4');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('BUSINESS_ALREADY_REGISTERED');

    expect(error.message).toBe(
      'The customer already has a registered business: a second registration is refused, never an overwrite.',
    );

    expect(error.facts).toEqual({ customerId: 'customer-4' });
  });
});
