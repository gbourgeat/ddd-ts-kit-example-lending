import { InMemoryRepository } from '@ddd-ts-kit/testing';
import { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import type { OrganisationRepository } from '@/contexts/identity/domain/repositories/organisation.repository';

export class FakeOrganisationRepository extends InMemoryRepository<Organisation> implements OrganisationRepository {
  constructor() {
    // A copy by rehydration and not a snapshot: a snapshot goes through `structuredClone`, which turns the value objects of the state into plain objects. The state is immutable, so sharing its values between copies is safe.
    super({ clone: (stored: Organisation) => Organisation.rehydrate(stored.id, stored.toState()) });
  }
}
