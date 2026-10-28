import { describe, expect, it } from '@jest/globals';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import { aDelegationTable } from '@/contexts/credit-policy/test/builders/delegation-table.builder';

describe('DelegationTable', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aDelegationTable().identifiedBy('delegation-table-7').bornAt(bornAt).build();

    expect(born.id).toBe('delegation-table-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is published', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aDelegationTable().identifiedBy('delegation-table-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([
      new DelegationTablePublished('delegation-table-7', bornAt, {
        effectiveFrom: recorded.effectiveFrom,
        levels: recorded.levels,
      }),
    ]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aDelegationTable().build();

    const loaded = DelegationTable.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aDelegationTable exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aDelegationTable().build();

    expect(built.effectiveFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});
