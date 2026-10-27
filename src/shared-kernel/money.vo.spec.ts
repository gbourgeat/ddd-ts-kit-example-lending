import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';

describe('Money', () => {
  it('holds an amount in whole cents, and compares by value', () => {
    expect(Money.ofCents(1234567).cents).toBe(1234567);
    expect(Money.ofCents(1234567).equals(Money.ofCents(1234567))).toBe(true);
    expect(Money.ofCents(1234567).equals(Money.ofCents(1234568))).toBe(false);
  });

  it('refuses a fraction of a cent, so no floating point reaches a ledger', () => {
    expectRefusal(() => Money.ofCents(10.5), 'INVALID_MONEY', { cents: 10.5 });
  });

  it('refuses a number too large to be exact', () => {
    expectRefusal(() => Money.ofCents(Number.MAX_SAFE_INTEGER + 1), 'INVALID_MONEY', {
      cents: Number.MAX_SAFE_INTEGER + 1,
    });
  });
});
