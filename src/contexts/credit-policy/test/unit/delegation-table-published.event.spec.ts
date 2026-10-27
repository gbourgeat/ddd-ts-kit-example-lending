import { describe, expect, it } from '@jest/globals';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';

describe('DelegationTablePublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new DelegationTablePublished('delegation-table-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('credit-policy.delegation-table.published');
    expect(event.aggregateId).toBe('delegation-table-1');
  });
});
