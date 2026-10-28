import { describe, expect, it } from '@jest/globals';
import { RateGridService } from '@/contexts/credit-application/offer/domain/services/rate-grid.service';

const bands = [
  { upToMonths: 84, rateBasisPoints: 640 },
  { upToMonths: 36, rateBasisPoints: 590 },
];

describe('RateGridService', () => {
  it('takes the rate of the shortest band that covers the duration', () => {
    expect(new RateGridService().bandRateOf(bands, 36)).toBe(590);
    expect(new RateGridService().bandRateOf(bands, 37)).toBe(640);
  });

  it('finds no rate for a duration beyond the grid', () => {
    expect(new RateGridService().bandRateOf(bands, 120)).toBeUndefined();
  });

  it('takes the entry in force on the day: the latest whose date of effect is not after it', () => {
    const entries = [
      { effectiveFrom: new Date('2026-01-01'), name: 'first' },
      { effectiveFrom: new Date('2026-04-01'), name: 'second' },
    ];

    expect(new RateGridService().inForceOn(entries, new Date('2026-03-31'))?.name).toBe('first');
    expect(new RateGridService().inForceOn(entries, new Date('2026-04-01'))?.name).toBe('second');
    expect(new RateGridService().inForceOn(entries, new Date('2025-12-31'))).toBeUndefined();
  });
});
