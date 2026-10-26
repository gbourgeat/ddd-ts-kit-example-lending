import { InMemoryRepository } from '@ddd-ts-kit/testing';
import { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';

export class FakeAccountRepository extends InMemoryRepository<Account> implements AccountRepository {
  constructor() {
    // A copy by rehydration and not a snapshot: a snapshot goes through `structuredClone`, which turns the value objects of the state into plain objects. The state is immutable, so sharing its values between copies is safe.
    super({ clone: (stored: Account) => Account.rehydrate(stored.id, stored.toState()) });
  }
}
