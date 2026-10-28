import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';
import { EventStoreLoanRepository } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-loan.repository';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const bornAt = new Date('2026-03-01T00:00:00.000Z');
let born = 0;

const expectations = {
  // A new aggregate, with its birth event to store: the builder hands one rebuilt from a history, which a store already holds.
  createAggregate: () => {
    born += 1;

    return Loan.create(`loan-${born}`, {
      paidOutAt: bornAt,
      borrower: Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris'),
      schedule: LoanSchedule.of(Money.ofCents(100_000), 500, 12),
    });
  },
  // TODO(domain): add `mutate: (changed: Loan) => changed.<a business method that records an event>(...)`, so that the suite proves an update is stored and a stale save is refused; the case stays pending until then.
  idOf: (subject: Loan) => subject.id,
  stateOf: (subject: Loan) => subject.toState(),
};

repositoryContract<Loan>(runner, {
  ...expectations,
  name: 'FakeLoanRepository',
  createRepository: () => new FakeLoanRepository(),
});

repositoryContract<Loan>(runner, {
  ...expectations,
  name: 'EventStoreLoanRepository on the in-memory event store',
  createRepository: () =>
    new EventStoreLoanRepository(new InMemoryEventStore(), new PersonalDataCipher(new InMemorySubjectKeyStore())),
});
