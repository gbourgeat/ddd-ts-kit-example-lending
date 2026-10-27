import { EventSerializer, EventSourcedRepository, type EventStore, type PersonalDataCipher } from '@ddd-ts-kit/kernel';
import { Loan, type LoanEvent, type LoanState } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { loanEvents } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';

/** The stream of Loan is `servicing.loan-<id>` in the event store the platform binds. */
export class EventStoreLoanRepository implements LoanRepository {
  private readonly streams: EventSourcedRepository<Loan, LoanEvent, LoanState>;

  constructor(store: EventStore, cipher: PersonalDataCipher) {
    this.streams = new EventSourcedRepository({
      store,
      category: 'servicing.loan',
      serializer: new EventSerializer<LoanEvent>(loanEvents, { cipher }),
      rehydrate: (id, history) => Loan.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...loanSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<Loan | undefined> {
    return this.streams.findById(id);
  }

  save(saved: Loan): Promise<void> {
    return this.streams.save(saved);
  }
}
