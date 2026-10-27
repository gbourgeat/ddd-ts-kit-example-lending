import { describe, expect, it } from '@jest/globals';
import { ResidualIncomeMinimumPublished } from '@/contexts/credit-policy/domain/events/residual-income-minimum-published.event';

describe('ResidualIncomeMinimumPublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new ResidualIncomeMinimumPublished('residual-income-minimum-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('credit-policy.residual-income-minimum.published');
    expect(event.aggregateId).toBe('residual-income-minimum-1');
  });
});
