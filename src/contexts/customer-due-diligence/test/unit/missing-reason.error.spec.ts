import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { MissingReason } from '@/contexts/customer-due-diligence/domain/errors/missing-reason.error';

describe('MissingReason', () => {
  it('refuses a dismissal of the customer with the code MISSING_REASON', () => {
    const error = MissingReason.forDismissal('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('MISSING_REASON');

    expect(error.message).toBe(
      'A possible match is dismissed only with the reason of the compliance officer: the reason is blank.',
    );

    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
