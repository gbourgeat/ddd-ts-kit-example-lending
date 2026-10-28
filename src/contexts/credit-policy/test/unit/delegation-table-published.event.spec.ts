import { describe, expect, it } from '@jest/globals';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';

describe('DelegationTablePublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new DelegationTablePublished('delegation-table-1', new Date('2026-01-01T00:00:00.000Z'), {
      effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
      levels: [{ level: 'advisor', amountCents: 1500000 }],
    });

    expect(event.name).toBe('credit-policy.delegation-table.published');
    expect(event.aggregateId).toBe('delegation-table-1');
  });

  it('carries the day the table takes effect and the amount of each level', () => {
    const event = new DelegationTablePublished('delegation-table-1', new Date('2026-01-01T00:00:00.000Z'), {
      effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
      levels: [{ level: 'advisor', amountCents: 1500000 }],
    });

    expect(event.publication).toEqual({
      effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
      levels: [{ level: 'advisor', amountCents: 1500000 }],
    });
  });
});
