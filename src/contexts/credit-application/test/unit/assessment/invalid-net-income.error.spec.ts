import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidNetIncome } from '@/contexts/credit-application/assessment/domain/errors/invalid-net-income.error';

describe('InvalidNetIncome', () => {
  it('refuses for cents with the code INVALID_NET_INCOME', () => {
    const error = InvalidNetIncome.forCents(0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_NET_INCOME');
    expect(error.message).toBe('The net income is not a positive amount of cents.');
  });
});
