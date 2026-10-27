import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import type { CustomerEvent } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';

interface CustomerBusinessRegisteredData {}

/** The birth carries no fact beyond its id and instant yet: a field added later is a new stored version with its upcaster. */
type CustomerIdentifiedData = Record<string, never>;

/** How the events of Customer are kept in its stream: one entry per event, read back by `decode`. */
export const customerEvents: StoredEventTypes<CustomerEvent> = {
  [CustomerIdentified.eventName]: defineStoredEvent(CustomerIdentified, {
    version: 1,
    encode: (): CustomerIdentifiedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new CustomerIdentified(aggregateId, occurredAt),
  }),
  [CustomerBusinessRegistered.eventName]: defineStoredEvent(CustomerBusinessRegistered, {
    version: 1,
    encode: (): CustomerBusinessRegisteredData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new CustomerBusinessRegistered(aggregateId, occurredAt),
  }),
};
