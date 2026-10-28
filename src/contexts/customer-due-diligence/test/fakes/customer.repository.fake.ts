import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import type { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { EventStoreCustomerRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-customer.repository';

/** The adapter itself over the in-memory stores of the kernel: what a handler spec saves to, events and all. */
export class FakeCustomerRepository implements CustomerRepository {
  readonly store = new InMemoryEventStore();

  private readonly adapter = new EventStoreCustomerRepository(
    this.store,
    new PersonalDataCipher(new InMemorySubjectKeyStore()),
  );

  findById(id: string): Promise<Customer | undefined> {
    return this.adapter.findById(id);
  }

  findDueBefore(instant: Date): Promise<readonly Customer[]> {
    return this.adapter.findDueBefore(instant);
  }

  save(saved: Customer): Promise<void> {
    return this.adapter.save(saved);
  }
}
