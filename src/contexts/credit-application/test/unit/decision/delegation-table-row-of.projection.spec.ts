import { describe, expect, it } from '@jest/globals';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import { delegationTableRowOf } from '@/contexts/credit-application/decision/application/projections/delegation-table-row-of.projection';

describe('Delegation table row, read from what credit-policy publishes', () => {
  it('keeps the table identifier, the day it takes effect and the amount of each level', () => {
    const event = delegationTablePublishedV2.create(
      {
        delegationTableId: 'delegation-table-1',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        levels: [{ level: 'level-1', amountCents: 500000 }],
      },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    expect(delegationTableRowOf(event.payload)).toEqual({
      delegationTableId: 'delegation-table-1',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      levels: [{ level: 'level-1', amountCents: 500000 }],
    });
  });
});
