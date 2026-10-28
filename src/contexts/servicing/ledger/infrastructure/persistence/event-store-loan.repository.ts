import {
  EventSerializer,
  EventSourcedRepository,
  type EventStore,
  type PersonalDataCipher,
  type StoredEvent,
} from '@ddd-ts-kit/kernel';
import { Loan, type LoanEvent, type LoanState } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { loanEvents } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';

const CATEGORY = 'servicing.loan';

/** How many events of the store one read of the whole store takes. */
const SCAN_PAGE_SIZE = 500;

/** The stream of Loan is `servicing.loan-<id>` in the event store the platform binds. */
export class EventStoreLoanRepository implements LoanRepository {
  private readonly streams: EventSourcedRepository<Loan, LoanEvent, LoanState>;

  constructor(
    private readonly store: EventStore,
    cipher: PersonalDataCipher,
  ) {
    this.streams = new EventSourcedRepository({
      store,
      category: CATEGORY,
      serializer: new EventSerializer<LoanEvent>(loanEvents, { cipher }),
      rehydrate: (id, history) => Loan.rehydrate(id, history),
      // TODO(domain): when a stream grows long enough to slow a load, add `snapshots: { ...loanSnapshots, store: snapshots, every: <n> }` (a SnapshotStore injected here, a snapshot mapper with its own shape version): see docs/concepts/event-sourcing.md of ddd-ts-kit.
    });
  }

  findById(id: string): Promise<Loan | undefined> {
    return this.streams.findById(id);
  }

  /** The store keeps no index of closures: each loan stream is read once, then tested on its own state. */
  async findClosedOnOrBefore(instant: Date): Promise<readonly Loan[]> {
    const found: Loan[] = [];

    for (const id of await this.loanIds()) {
      const loan = await this.findById(id);

      if (loan?.closedOnOrBefore(instant) === true) {
        found.push(loan);
      }
    }

    return found;
  }

  /** The store keeps no index of the open loans either: each loan stream is read once, then tested on its own state. */
  async findOpen(): Promise<readonly Loan[]> {
    const open: Loan[] = [];

    for (const id of await this.loanIds()) {
      const loan = await this.findById(id);

      if (loan !== undefined && loan.closedAt === undefined) {
        open.push(loan);
      }
    }

    return open;
  }

  save(saved: Loan): Promise<void> {
    return this.streams.save(saved);
  }

  /** The identifiers of the loan streams, read from the whole store in the order its appends committed. */
  private async loanIds(): Promise<string[]> {
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
