import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { AmountBounds } from '@/contexts/credit-policy/domain/value-objects/amount-bounds.vo';

describe('AmountBounds', () => {
  it('keeps the minimum and the maximum amount in cents', () => {
    const bounds = AmountBounds.create(100_000, 2_500_000);

    expect(bounds.minimumCents).toBe(100_000);
    expect(bounds.maximumCents).toBe(2_500_000);
  });

  it('accepts a minimum equal to its maximum', () => {
    const bounds = AmountBounds.create(500_000, 500_000);

    expect(bounds.maximumCents).toBe(500_000);
  });

  it('refuses a minimum amount above its maximum with the code PRODUCT_BOUNDS_INVERTED', () => {
    expectRefusal(() => AmountBounds.create(2_500_000, 100_000), 'PRODUCT_BOUNDS_INVERTED');
  });
});
