import { EventSerializer, EventSourcedRepository, type EventStore, type PersonalDataCipher } from '@ddd-ts-kit/kernel';
import {
  CreditApplication,
  type CreditApplicationEvent,
  type CreditApplicationState,
} from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { creditApplicationEvents } from '@/contexts/credit-application/file/infrastructure/persistence/credit-application-events.mapper';

/** The stream of CreditApplication is `credit-application.credit-application-<id>` in the event store the platform binds. */
export class EventStoreCreditApplicationRepository implements CreditApplicationRepository {
  private readonly streams: EventSourcedRepository<CreditApplication, CreditApplicationEvent, CreditApplicationState>;

  constructor(store: EventStore, cipher: PersonalDataCipher) {
    this.streams = new EventSourcedRepository({
      store,
      category: 'credit-application.credit-application',
      serializer: new EventSerializer<CreditApplicationEvent>(creditApplicationEvents, { cipher }),
      rehydrate: (id, history) => CreditApplication.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...creditApplicationSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<CreditApplication | undefined> {
    return this.streams.findById(id);
  }

  save(saved: CreditApplication): Promise<void> {
    return this.streams.save(saved);
  }
}
