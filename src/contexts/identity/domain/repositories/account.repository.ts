import { Repository } from '@ddd-ts-kit/kernel';
import type { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';

/** The accounts, by the subject the identity provider gives each person. */
export abstract class AccountRepository extends Repository<Account> {}
