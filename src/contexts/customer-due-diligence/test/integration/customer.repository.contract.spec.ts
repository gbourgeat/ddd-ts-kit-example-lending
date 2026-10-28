import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { EventStoreCustomerRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-customer.repository';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const bornAt = new Date('2026-03-01T00:00:00.000Z');
let born = 0;

const expectations = {
  // A new aggregate, with its birth event to store: the builder hands one rebuilt from a history, which a store already holds.
  createAggregate: () => {
    born += 1;

    return Customer.create(`customer-${born}`, aPersonIdentity(), bornAt);
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

describeFindDueBefore('FakeCustomerRepository', () => new FakeCustomerRepository());

describeFindDueBefore(
  'EventStoreCustomerRepository on the in-memory event store',
  () =>
    new EventStoreCustomerRepository(new InMemoryEventStore(), new PersonalDataCipher(new InMemorySubjectKeyStore())),
);

/** The finder of the overdue refreshes: the customers whose due diligence falls due before an instant, and only them. */
function describeFindDueBefore(name: string, createRepository: () => CustomerRepository): void {
  describe(`${name}.findDueBefore`, () => {
    it('finds the customers whose due diligence falls due before the instant, and only them', async () => {
      const repository = createRepository();

      await repository.save(refreshedCustomer('customer-high', 'high'));
      await repository.save(refreshedCustomer('customer-low', 'low'));

      const found = await repository.findDueBefore(new Date('2027-06-01T00:00:00.000Z'));

      expect(found.map((customer) => customer.id)).toEqual(['customer-high']);
    });

    it('finds no customer in a store where no customer was refreshed', async () => {
      const repository = createRepository();

      await repository.save(Customer.create('customer-new', aPersonIdentity(), bornAt));

      expect(await repository.findDueBefore(new Date('2099-01-01T00:00:00.000Z'))).toEqual([]);
    });
  });
}

/** A customer whose due diligence was refreshed on the day of birth, at the given risk rating. */
function refreshedCustomer(id: string, rating: 'low' | 'medium' | 'high'): Customer {
  const customer = Customer.create(id, aPersonIdentity(), bornAt);

  customer.rateRisk(rating, bornAt);
  customer.refreshDueDiligence('clear', bornAt);

  return customer;
}
