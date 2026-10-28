import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownRateGrid } from '@/contexts/credit-application/offer/domain/errors/unknown-rate-grid.error';

describe('UnknownRateGrid', () => {
  it('refuses for unknown rate grid with the code UNKNOWN_RATE_GRID', () => {
    const error = UnknownRateGrid.forUnknownRateGrid();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_RATE_GRID');
    expect(error.message).toBe('Unknown rate grid.');
    expect(error.facts).toEqual({});
  });
});
