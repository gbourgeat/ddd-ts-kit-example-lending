import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ProductBoundsInverted } from '@/contexts/credit-policy/domain/errors/product-bounds-inverted.error';

describe('ProductBoundsInverted', () => {
  it('refuses an amount minimum above its maximum with the code PRODUCT_BOUNDS_INVERTED', () => {
    const error = ProductBoundsInverted.onAmount(500_000, 100_000);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PRODUCT_BOUNDS_INVERTED');
    expect(error.facts).toEqual({ minimum: 500_000, maximum: 100_000 });
  });

  it('refuses a duration minimum above its maximum with the code PRODUCT_BOUNDS_INVERTED', () => {
    const error = ProductBoundsInverted.onDuration(96, 12);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PRODUCT_BOUNDS_INVERTED');
    expect(error.facts).toEqual({ minimum: 96, maximum: 12 });
  });
});
