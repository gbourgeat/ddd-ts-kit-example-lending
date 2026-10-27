import { describe, expect, it } from '@jest/globals';
import { StoredEventData } from '@ddd-ts-kit/kernel';
import { customerEvents } from '@/contexts/customer-due-diligence/infrastructure/persistence/customer-events.mapper';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const registeredOn = new Date('2026-02-14T00:00:00.000Z');

describe('customerEvents', () => {
  it('stores the birth of a customer as version 1', () => {
    const stored = customerEvents[CustomerIdentified.eventName];

    expect(stored.version).toBe(1);
    expect(stored.encode(new CustomerIdentified('customer-7', bornAt))).toBeDefined();
  });

  it('stores the facts of a business registration, and reads them back as they were recorded', () => {
    const stored = customerEvents[CustomerBusinessRegistered.eventName];

    const registered = new CustomerBusinessRegistered(
      'customer-7',
      bornAt,
      'Boulangerie Dupont SARL',
      'RC-75-123',
      'FR',
      registeredOn,
    );

    const data = stored.encode(registered);

    const decoded = stored.decode(new StoredEventData(data, 'customer-business-registered'), {
      id: 'event-1',
      aggregateId: 'customer-7',
      occurredAt: bornAt,
      version: 2,
    });

    expect(decoded).toEqual(registered);
  });
});
