import { InMemoryEventStore, InMemorySubjectKeyStore, PersonalDataCipher } from '@ddd-ts-kit/kernel';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { EventStoreLoanRepository } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-loan.repository';

/** The adapter itself over the in-memory stores of the kernel: what a handler spec saves to, events and all. */
export class FakeLoanRepository implements LoanRepository {
  readonly store = new InMemoryEventStore();

  private readonly adapter = new EventStoreLoanRepository(
    this.store,
    new PersonalDataCipher(new InMemorySubjectKeyStore()),
  );

  findById(id: string): Promise<Loan | undefined> {
    return this.adapter.findById(id);
  }

  save(saved: Loan): Promise<void> {
    return this.adapter.save(saved);
  }

  // TODO(domain): implement each lookup of LoanRepository over the events of `this.store`, so that handlers are tested against a working repository.
}
