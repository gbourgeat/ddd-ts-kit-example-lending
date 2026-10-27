import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { DurationBounds } from '@/contexts/credit-policy/domain/value-objects/duration-bounds.vo';

describe('DurationBounds', () => {
  it('keeps the minimum and the maximum duration in months', () => {
    const bounds = DurationBounds.create(12, 84);

    expect(bounds.minimumMonths).toBe(12);
    expect(bounds.maximumMonths).toBe(84);
  });

  it('accepts a minimum equal to its maximum', () => {
    const bounds = DurationBounds.create(24, 24);

    expect(bounds.maximumMonths).toBe(24);
  });

  it('refuses a minimum duration above its maximum with the code PRODUCT_BOUNDS_INVERTED', () => {
    expectRefusal(() => DurationBounds.create(96, 12), 'PRODUCT_BOUNDS_INVERTED');
  });
});
