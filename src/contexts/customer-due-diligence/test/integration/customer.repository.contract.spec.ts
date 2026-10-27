import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { EventStoreCustomerRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-customer.repository';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const bornAt = new Date('2026-03-01T00:00:00.000Z');
let born = 0;

const expectations = {
  // A new aggregate, with its birth event to store: the builder hands one rebuilt from a history, which a store already holds.
  createAggregate: () => {
    born += 1;

    return Customer.create(`customer-${born}`, bornAt);
  },
  // The business of the customer is registered: an update the store must keep, and refuse stale once saved.
  mutate: (changed: Customer) =>
    changed.registerBusiness(
      {
        legalName: 'Boulangerie Dupont SARL',
        registrationNumber: 'RC-75-123',
        countryOfRegistration: 'FR',
        registeredOn: bornAt,
      },
      bornAt,
    ),
  idOf: (subject: Customer) => subject.id,
  stateOf: (subject: Customer) => subject.toState(),
};

repositoryContract<Customer>(runner, {
  ...expectations,
  name: 'FakeCustomerRepository',
  createRepository: () => new FakeCustomerRepository(),
});

repositoryContract<Customer>(runner, {
  ...expectations,
  name: 'EventStoreCustomerRepository on the in-memory event store',
  createRepository: () =>
    new EventStoreCustomerRepository(new InMemoryEventStore(), new PersonalDataCipher(new InMemorySubjectKeyStore())),
});
