import { describe, expect, it } from '@jest/globals';
import { EventSerializer, InMemorySubjectKeyStore, PersonalDataCipher, StoredEventData } from '@ddd-ts-kit/kernel';
import { customerEvents } from '@/contexts/customer-due-diligence/infrastructure/persistence/customer-events.mapper';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const registeredOn = new Date('2026-02-14T00:00:00.000Z');

describe('customerEvents', () => {
  it('stores the birth of a customer as version 2, and reads back the identity it was checked on', async () => {
    const stored = customerEvents[CustomerIdentified.eventName];

    const serializer = new EventSerializer(customerEvents, {
      cipher: new PersonalDataCipher(new InMemorySubjectKeyStore()),
    });

    const identified = new CustomerIdentified('customer-7', bornAt, aPersonIdentity());

    const data = await serializer.open(await serializer.seal(stored.encode(identified)));

    const decoded = stored.decode(new StoredEventData(data, 'customer-identified'), {
      id: 'event-1',
      aggregateId: 'customer-7',
      occurredAt: bornAt,
      version: 2,
    });

    expect(stored.version).toBe(2);
    expect(decoded).toEqual(identified);
  });

  it('reads a birth of version 1, which recorded no identity, as not identified', () => {
    const stored = customerEvents[CustomerIdentified.eventName];

    const decoded = stored.decode(new StoredEventData(stored.upcasters[1]?.({}) ?? {}, 'customer-identified'), {
      id: 'event-1',
      aggregateId: 'customer-7',
      occurredAt: bornAt,
      version: 1,
    });

    expect(decoded).toEqual(new CustomerIdentified('customer-7', bornAt));
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
