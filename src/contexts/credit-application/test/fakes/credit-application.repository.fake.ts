import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import type { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';

/** The adapter itself over the in-memory stores of the kernel: what a handler spec saves to, events and all. */
export class FakeCreditApplicationRepository implements CreditApplicationRepository {
  readonly store = new InMemoryEventStore();

  private readonly adapter = new EventStoreCreditApplicationRepository(
    this.store,
    new PersonalDataCipher(new InMemorySubjectKeyStore()),
  );

  findById(id: string): Promise<CreditApplication | undefined> {
    return this.adapter.findById(id);
  }

  save(saved: CreditApplication): Promise<void> {
    return this.adapter.save(saved);
  }

  findRefusedOnOrBefore(instant: Date): Promise<readonly CreditApplication[]> {
    return this.adapter.findRefusedOnOrBefore(instant);
  }
}
