import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoPossibleMatch } from '@/contexts/customer-due-diligence/domain/errors/no-possible-match.error';

describe('NoPossibleMatch', () => {
  it('refuses for customer with the code NO_POSSIBLE_MATCH', () => {
    const error = NoPossibleMatch.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_POSSIBLE_MATCH');

    expect(error.message).toBe(
      'No possible match is waiting for compliance review on this customer: only a possible match can be confirmed.',
    );

    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
