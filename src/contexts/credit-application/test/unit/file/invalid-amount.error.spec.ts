import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';

describe('InvalidAmount', () => {
  it('refuses for cents with the code INVALID_AMOUNT', () => {
    const error = InvalidAmount.forCents(0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_AMOUNT');
    expect(error.message).toBe('The requested amount is not a positive whole number of cents.');
  });
});
