import {
  EventSerializer,
  EventSourcedRepository,
  type EventStore,
  type PersonalDataCipher,
  type StoredEvent,
} from '@ddd-ts-kit/kernel';
import {
  CreditApplication,
  type CreditApplicationEvent,
  type CreditApplicationState,
} from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { RefusalRetentionService } from '@/contexts/credit-application/file/domain/services/refusal-retention.service';
import { creditApplicationEvents } from '@/contexts/credit-application/file/infrastructure/persistence/credit-application-events.mapper';

const CATEGORY = 'credit-application.credit-application';

/** How many events of the store one read of the whole store takes. */
const SCAN_PAGE_SIZE = 500;

/** The stream of CreditApplication is `credit-application.credit-application-<id>` in the event store the platform binds. */
export class EventStoreCreditApplicationRepository implements CreditApplicationRepository {
  private readonly streams: EventSourcedRepository<CreditApplication, CreditApplicationEvent, CreditApplicationState>;

  constructor(
    private readonly store: EventStore,
    cipher: PersonalDataCipher,
  ) {
    this.streams = new EventSourcedRepository({
      store,
      category: CATEGORY,
      serializer: new EventSerializer<CreditApplicationEvent>(creditApplicationEvents, { cipher }),
      rehydrate: (id, history) => CreditApplication.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...creditApplicationSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<CreditApplication | undefined> {
    return this.streams.findById(id);
  }

  /** The store keeps no index of refusals: each application stream is read once, then tested on its own state. */
  async findRefusedOnOrBefore(instant: Date): Promise<readonly CreditApplication[]> {
    const found: CreditApplication[] = [];

    for (const id of await this.applicationIds()) {
      const application = await this.findById(id);

      if (application !== undefined && new RefusalRetentionService().isPastRetention(application.toState(), instant)) {
        found.push(application);
      }
    }

    return found;
  }

  save(saved: CreditApplication): Promise<void> {
    return this.streams.save(saved);
  }

  /** The identifiers of the application streams, read from the whole store in the order its appends committed. */
  private async applicationIds(): Promise<string[]> {
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
