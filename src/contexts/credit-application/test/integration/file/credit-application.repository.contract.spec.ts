import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const bornAt = new Date('2026-03-01T00:00:00.000Z');
let born = 0;

const expectations = {
  // A new aggregate, with its birth event to store: the builder hands one rebuilt from a history, which a store already holds.
  createAggregate: () => {
    born += 1;

    return CreditApplication.create(`credit-application-${born}`, 'customer-1', {
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      registeredAt: bornAt,
      branchId: 'branch-1',
    });
  },
  // TODO(domain): add `mutate: (changed: CreditApplication) => changed.<a business method that records an event>(...)`, so that the suite proves an update is stored and a stale save is refused; the case stays pending until then.
  idOf: (subject: CreditApplication) => subject.id,
  stateOf: (subject: CreditApplication) => subject.toState(),
};

repositoryContract<CreditApplication>(runner, {
  ...expectations,
  name: 'FakeCreditApplicationRepository',
  createRepository: () => new FakeCreditApplicationRepository(),
});

repositoryContract<CreditApplication>(runner, {
  ...expectations,
  name: 'EventStoreCreditApplicationRepository on the in-memory event store',
  createRepository: () =>
    new EventStoreCreditApplicationRepository(
      new InMemoryEventStore(),
      new PersonalDataCipher(new InMemorySubjectKeyStore()),
    ),
});
