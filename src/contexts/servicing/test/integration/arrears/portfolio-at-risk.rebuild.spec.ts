import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  Criteria,
  CatchUpSubscription,
  EventSerializer,
  EventStoreProjectionRebuild,
  InMemoryCheckpointStore,
  InMemoryEventStore,
  InMemoryReadModelTable,
  InMemorySubjectKeyStore,
  InMemoryUnitOfWork,
  PersonalDataCipher,
  ScopedCriteria,
  TableReadModelStore,
} from '@ddd-ts-kit/kernel';
import { applyingProjection } from '@ddd-ts-kit/kernel/declarations';
import { PortfolioAtRiskProjection } from '@/contexts/servicing/arrears/application/projections/portfolio-at-risk.projection';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';
import { portfolioAtRiskCriteria } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.criteria';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import { EventStoreLoanRepository } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-loan.repository';
import { loanEvents } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';
import { Money } from '@/shared-kernel/money.vo';

const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const FIRST_DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const SUBSCRIBER = 'servicing.portfolio-at-risk';
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** The event store of the loans, the loans written through it and the serializer that reads their events back. */
interface LoanStore {
  readonly events: InMemoryEventStore;
  readonly loans: EventStoreLoanRepository;
  readonly serializer: EventSerializer<LoanEvent>;
}

/** The arrears of the loans, as the catch-up subscription of the projection built them: one table, one checkpoint. */
interface CaughtUp {
  readonly table: InMemoryReadModelTable<PortfolioAtRiskRow>;
  readonly subscription: CatchUpSubscription;
}

describe('Portfolio at risk, rebuilt from zero in the event store', () => {
  let store: LoanStore;
  let caughtUp: CaughtUp;

  beforeEach(() => {
    const events = new InMemoryEventStore();
    const cipher = new PersonalDataCipher(new InMemorySubjectKeyStore());

    store = {
      events,
      loans: new EventStoreLoanRepository(events, cipher),
      serializer: new EventSerializer(loanEvents, { cipher }),
    };

    caughtUp = catchingUpFrom(store, new InMemoryReadModelTable<PortfolioAtRiskRow>());
  });

  it('rebuilds from zero the rows the catch-up built event by event', async () => {
    await payOut(store, 'loan-1', 400_000);
    await caughtUp.subscription.catchUp();
    await payOut(store, 'loan-2', 300_000);
    await caughtUp.subscription.catchUp();
    await payOut(store, 'loan-3', 100_000);
    await caughtUp.subscription.catchUp();
    await moveInArrears(store, 'loan-1', daysAfter(FIRST_DUE_ON, 10));
    await caughtUp.subscription.catchUp();
    await moveInArrears(store, 'loan-1', daysAfter(FIRST_DUE_ON, 40));
    await moveInArrears(store, 'loan-2', daysAfter(FIRST_DUE_ON, 70));
    await closeLoan(store, 'loan-3');
    await caughtUp.subscription.catchUp();

    const builtEventByEvent = await rowsOf(caughtUp.table);
    const rebuilt = new InMemoryReadModelTable<PortfolioAtRiskRow>();

    await rebuildFrom(store, rebuilt);

    expect(builtEventByEvent).toEqual([
      { loanId: 'loan-1', principalCents: 400_000, bucket: ArrearsBucket.ThirtyOneToSixtyDays, open: true },
      { loanId: 'loan-2', principalCents: 300_000, bucket: ArrearsBucket.SixtyOneToNinetyDays, open: true },
      { loanId: 'loan-3', principalCents: 100_000, bucket: ArrearsBucket.None, open: false },
    ]);

    expect(await rowsOf(rebuilt)).toEqual(builtEventByEvent);
  });

  it('rebuilds the rows of a read model already built, to the same rows', async () => {
    await payOut(store, 'loan-1', 400_000);
    await moveInArrears(store, 'loan-1', daysAfter(FIRST_DUE_ON, 100));
    await caughtUp.subscription.catchUp();
    const before = await rowsOf(caughtUp.table);

    await rebuildFrom(store, caughtUp.table);

    expect(await rowsOf(caughtUp.table)).toEqual(before);
  });
});

/** A catch-up subscription that applies the projection to the table, one event per batch. */
function catchingUpFrom(store: LoanStore, table: InMemoryReadModelTable<PortfolioAtRiskRow>): CaughtUp {
  const live = new TableReadModelStore(table, portfolioAtRiskCriteria);

  const subscription = new CatchUpSubscription({
    name: SUBSCRIBER,
    store: store.events,
    checkpoints: new InMemoryCheckpointStore(),
    unitOfWork: new InMemoryUnitOfWork(),
    apply: applyingProjection(new PortfolioAtRiskProjection(live), store.serializer),
    batchSize: 1,
  });

  return { table, subscription };
}

/** Rebuilds the table from position zero of the event store, as a rebuild does from its copy. */
async function rebuildFrom(store: LoanStore, table: InMemoryReadModelTable<PortfolioAtRiskRow>): Promise<void> {
  await new EventStoreProjectionRebuild({
    table,
    store: store.events,
    unitOfWork: new InMemoryUnitOfWork(),
    applierOn: (copy) => applyingProjection(new PortfolioAtRiskProjection(copy), store.serializer),
  }).run();
}

/** The rows of the table, in the order of their loan. */
async function rowsOf(table: InMemoryReadModelTable<PortfolioAtRiskRow>): Promise<readonly PortfolioAtRiskRow[]> {
  const page = await new TableReadModelStore(table, portfolioAtRiskCriteria).search(
    ScopedCriteria.within(Criteria.of<PortfolioAtRiskRow>().orderBy('loanId'), { conditions: [], empty: false }),
  );

  return page.items.map((row) => ({ ...row }));
}

async function payOut(store: LoanStore, loanId: string, principalCents: number): Promise<void> {
  const loan = Loan.create(loanId, {
    paidOutAt: PAID_OUT_ON,
    borrower: Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris'),
    schedule: LoanSchedule.of(Money.ofCents(principalCents), 500, 12),
  });

  await store.loans.save(loan);
}

/** The first instalment is unpaid on its due date; the loan is then classified `now`. */
async function moveInArrears(store: LoanStore, loanId: string, now: Date): Promise<void> {
  const loan = await requireLoan(store, loanId);

  loan.computeDueInstalments(FIRST_DUE_ON);
  loan.markUnpaid(1, FIRST_DUE_ON);
  loan.classifyArrears(now);
  await store.loans.save(loan);
}

async function closeLoan(store: LoanStore, loanId: string): Promise<void> {
  const loan = await requireLoan(store, loanId);

  loan.close(FIRST_DUE_ON);
  await store.loans.save(loan);
}

async function requireLoan(store: LoanStore, loanId: string): Promise<Loan> {
  const loan = await store.loans.findById(loanId);

  if (loan === undefined) {
    throw new Error(`no loan ${loanId}`);
  }

  return loan;
}

function daysAfter(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MILLISECONDS_PER_DAY);
}
