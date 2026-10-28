import {
  EventSerializer,
  EventSourcedRepository,
  type EventStore,
  type PersonalDataCipher,
  type SnapshotStore,
  type StoredEvent,
} from '@ddd-ts-kit/kernel';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { loanEvents, loanSnapshots } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';

const CATEGORY = 'servicing.loan';

/** How many events of the store one read of the whole store takes. */
const SCAN_PAGE_SIZE = 500;

/** A snapshot of a loan is taken by the save that makes its stream reach a multiple of this many events: an optimisation only. */
export const LOAN_SNAPSHOT_EVERY = 20;

/** The stream of Loan is `servicing.loan-<id>` in the event store the platform binds. */
export class EventStoreLoanRepository implements LoanRepository {
  private readonly streams: EventSourcedRepository<Loan, LoanEvent, LoanState>;
  private readonly serializer: EventSerializer<LoanEvent>;

  constructor(
    private readonly store: EventStore,
    cipher: PersonalDataCipher,
    snapshots?: SnapshotStore,
  ) {
    this.serializer = new EventSerializer<LoanEvent>(loanEvents, { cipher });

    this.streams = new EventSourcedRepository({
      store,
      category: CATEGORY,
      serializer: this.serializer,
      rehydrate: (id, history) => Loan.rehydrate(id, history),
      ...(snapshots === undefined
        ? {}
        : { snapshots: { ...loanSnapshots, store: snapshots, every: LOAN_SNAPSHOT_EVERY } }),
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

  /** The events of the stream, opened by the serializer in their order: an erased personal value reads as erased. */
  async historyOf(id: string): Promise<readonly LoanEvent[]> {
    const stored = await this.store.readStream(EventSourcedRepository.streamOf(CATEGORY, id));

    return Promise.all(stored.map((event) => this.serializer.deserialize(event)));
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
