import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidArrangementFee } from '@/contexts/credit-policy/domain/errors/invalid-arrangement-fee.error';

describe('InvalidArrangementFee', () => {
  it('refuses a negative fee with the code INVALID_ARRANGEMENT_FEE and exposes its cents', () => {
    const error = InvalidArrangementFee.forCents(-1);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_ARRANGEMENT_FEE');
    expect(error.facts).toEqual({ cents: -1 });
  });
});
