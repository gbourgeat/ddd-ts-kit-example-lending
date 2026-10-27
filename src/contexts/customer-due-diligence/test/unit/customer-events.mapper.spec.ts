import { describe, expect, it } from '@jest/globals';
import { customerEvents } from '@/contexts/customer-due-diligence/infrastructure/persistence/customer-events.mapper';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

describe('customerEvents', () => {
  it('stores the birth of a customer as version 1', () => {
    const stored = customerEvents[CustomerIdentified.eventName];

    expect(stored.version).toBe(1);
    expect(stored.encode(new CustomerIdentified('customer-7', new Date('2026-03-01T00:00:00.000Z')))).toBeDefined();
  });
});
