import { describe, expect, it } from '@jest/globals';
import { AlertRaised } from '@/contexts/financial-crime/domain/events/alert-raised.event';

describe('AlertRaised', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new AlertRaised('alert-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('financial-crime.alert.raised');
    expect(event.aggregateId).toBe('alert-1');
  });
});
