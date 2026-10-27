import { describe, expect, it } from '@jest/globals';
import { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';
import { aRetentionPeriod } from '@/contexts/data-protection/test/builders/retention-period.builder';

describe('RetentionPeriod', () => {
  it('is born with its identity, the context and the kind of data it covers, and its duration', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aRetentionPeriod()
      .identifiedBy('retention-7')
      .ofContext('credit-application')
      .forKind('loan')
      .lastingMonths(120)
      .bornAt(bornAt)
      .build();

    expect(born.id).toBe('retention-7');
    expect(born.contextName).toBe('credit-application');
    expect(born.kindOfData).toBe('loan');
    expect(born.durationInMonths).toBe(120);
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('is rehydrated in its stored state', () => {
    const stored = aRetentionPeriod().build();

    const loaded = RetentionPeriod.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
