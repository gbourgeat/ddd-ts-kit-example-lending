import { describe, expect, it } from '@jest/globals';
import { MonthsRemainingService } from '@/contexts/servicing/ledger/domain/services/months-remaining.service';

const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const TWELVE_MONTHS = 12;

describe('MonthsRemainingService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new MonthsRemainingService())).toEqual([]);
  });

  it('counts every month of the schedule when no instalment has fallen due yet', () => {
    const remaining = new MonthsRemainingService().of({
      paidOutAt: PAID_OUT_ON,
      now: new Date('2026-01-09T00:00:00.000Z'),
      notedBefore: 0,
      lastNumber: TWELVE_MONTHS,
    });

    expect(remaining).toBe(TWELVE_MONTHS);
  });

  it('counts only the months still to run once instalments have fallen due', () => {
    const remaining = new MonthsRemainingService().of({
      paidOutAt: PAID_OUT_ON,
      now: new Date('2026-03-10T00:00:00.000Z'),
      notedBefore: 0,
      lastNumber: TWELVE_MONTHS,
    });

    expect(remaining).toBe(TWELVE_MONTHS - 2);
  });
});
