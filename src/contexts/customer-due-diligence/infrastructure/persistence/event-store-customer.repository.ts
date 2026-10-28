import {
  EventSerializer,
  EventSourcedRepository,
  type EventStore,
  type PersonalDataCipher,
  type StoredEvent,
} from '@ddd-ts-kit/kernel';
import {
  Customer,
  type CustomerEvent,
  type CustomerState,
} from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { customerEvents } from '@/contexts/customer-due-diligence/infrastructure/persistence/customer-events.mapper';

const CATEGORY = 'customer-due-diligence.customer';

/** How many events of the store one read of the whole store takes. */
const SCAN_PAGE_SIZE = 500;

/** The stream of Customer is `customer-due-diligence.customer-<id>` in the event store the platform binds. */
export class EventStoreCustomerRepository implements CustomerRepository {
  private readonly streams: EventSourcedRepository<Customer, CustomerEvent, CustomerState>;

  constructor(
    private readonly store: EventStore,
    cipher: PersonalDataCipher,
  ) {
    this.streams = new EventSourcedRepository({
      store,
      category: CATEGORY,
      serializer: new EventSerializer<CustomerEvent>(customerEvents, { cipher }),
      rehydrate: (id, history) => Customer.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...customerSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<Customer | undefined> {
    return this.streams.findById(id);
  }

  /** The store keeps no index of due dates: each customer stream is read once, then tested on its own state. */
  findDueBefore(instant: Date): Promise<readonly Customer[]> {
    return this.matching((customer) => customer.isDueBefore(instant));
  }

  /** The store keeps no index of relationship ends either: each customer stream is read once, then tested on its own state. */
  findEndedOnOrBefore(instant: Date): Promise<readonly Customer[]> {
    return this.matching((customer) => customer.hasEndedOnOrBefore(instant));
  }

  save(saved: Customer): Promise<void> {
    return this.streams.save(saved);
  }

  /** The customers whose state the test accepts, each stream read once. */
  private async matching(test: (customer: Customer) => boolean): Promise<readonly Customer[]> {
    const found: Customer[] = [];

    for (const id of await this.customerIds()) {
      const customer = await this.findById(id);

      if (customer !== undefined && test(customer)) {
        found.push(customer);
      }
    }

    return found;
  }

  /** The identifiers of the customer streams, read from the whole store in the order its appends committed. */
  private async customerIds(): Promise<string[]> {
    const ids = new Set<string>();
    let after = 0;
    let page: readonly StoredEvent[];

    do {
      page = await this.store.readAll(after, SCAN_PAGE_SIZE);

      for (const event of page) {
        if (event.stream.startsWith(`${CATEGORY}-`)) {
          ids.add(event.stream.slice(CATEGORY.length + 1));
        }
      }

      after = page.at(-1)?.position ?? after;
    } while (page.length === SCAN_PAGE_SIZE);

    return [...ids];
  }
}
