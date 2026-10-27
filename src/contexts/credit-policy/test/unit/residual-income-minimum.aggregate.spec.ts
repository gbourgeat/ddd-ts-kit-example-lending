import { describe, expect, it } from '@jest/globals';
import { ResidualIncomeMinimumPublished } from '@/contexts/credit-policy/domain/events/residual-income-minimum-published.event';
import { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import { aResidualIncomeMinimum } from '@/contexts/credit-policy/test/builders/residual-income-minimum.builder';

describe('ResidualIncomeMinimum', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aResidualIncomeMinimum().identifiedBy('residual-income-minimum-7').bornAt(bornAt).build();

    expect(born.id).toBe('residual-income-minimum-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is published', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aResidualIncomeMinimum().identifiedBy('residual-income-minimum-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([new ResidualIncomeMinimumPublished('residual-income-minimum-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aResidualIncomeMinimum().build();

    const loaded = ResidualIncomeMinimum.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aResidualIncomeMinimum exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aResidualIncomeMinimum().build();

    expect(built.perAdultInCents).toEqual(80000);
    expect(built.perChildInCents).toEqual(30000);
    expect(built.effectiveFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});
