import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerNotHighRisk } from '@/contexts/customer-due-diligence/domain/errors/customer-not-high-risk.error';

describe('CustomerNotHighRisk', () => {
  it('refuses the approval of a customer that is not rated high risk, with the code CUSTOMER_NOT_HIGH_RISK', () => {
    const error = CustomerNotHighRisk.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CUSTOMER_NOT_HIGH_RISK');
    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
