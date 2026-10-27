import { EventSerializer, EventSourcedRepository, type EventStore, type PersonalDataCipher } from '@ddd-ts-kit/kernel';
import {
  Customer,
  type CustomerEvent,
  type CustomerState,
} from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { customerEvents } from '@/contexts/customer-due-diligence/infrastructure/persistence/customer-events.mapper';

/** The stream of Customer is `customer-due-diligence.customer-<id>` in the event store the platform binds. */
export class EventStoreCustomerRepository implements CustomerRepository {
  private readonly streams: EventSourcedRepository<Customer, CustomerEvent, CustomerState>;

  constructor(store: EventStore, cipher: PersonalDataCipher) {
    this.streams = new EventSourcedRepository({
      store,
      category: 'customer-due-diligence.customer',
      serializer: new EventSerializer<CustomerEvent>(customerEvents, { cipher }),
      rehydrate: (id, history) => Customer.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...customerSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<Customer | undefined> {
    return this.streams.findById(id);
  }

  save(saved: Customer): Promise<void> {
    return this.streams.save(saved);
  }
}
