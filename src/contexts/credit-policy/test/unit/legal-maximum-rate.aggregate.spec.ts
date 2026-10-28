import { describe, expect, it } from '@jest/globals';
import { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import { aLegalMaximumRate } from '@/contexts/credit-policy/test/builders/legal-maximum-rate.builder';

describe('LegalMaximumRate', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aLegalMaximumRate().identifiedBy('legal-maximum-rate-7').bornAt(bornAt).build();

    expect(born.id).toBe('legal-maximum-rate-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is published', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aLegalMaximumRate().identifiedBy('legal-maximum-rate-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([
      new LegalMaximumRatePublished('legal-maximum-rate-7', bornAt, {
        category: recorded.category,
        rateBasisPoints: recorded.rateBasisPoints,
        effectiveFrom: recorded.effectiveFrom,
      }),
    ]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aLegalMaximumRate().build();

    const loaded = LegalMaximumRate.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aLegalMaximumRate exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aLegalMaximumRate().build();

    expect(built.category).toEqual('personal');
    expect(built.rateBasisPoints).toBe(2000);
    expect(built.effectiveFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});
