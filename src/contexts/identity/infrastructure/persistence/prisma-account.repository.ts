import { optimisticUpdate } from '@ddd-ts-kit/prisma';
import { stampCreation, stampUpdate, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';
import type { Database } from '@/platform/database/database';
import { AccountMapper, type AccountColumns } from '@/contexts/identity/infrastructure/persistence/account.mapper';

type VersionedAccount = AccountColumns & { readonly version: number };

export class PrismaAccountRepository implements AccountRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Account | undefined> {
    const row = await accountsOf(this.database).findUnique({ where: { id } });

    return row === null ? undefined : AccountMapper.toDomain(row);
  }

  async save(saved: Account): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...AccountMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  private insert(state: VersionedAccount): Promise<{ count: number }> {
    const row = { ...state, ...stampCreation(this.scope, this.clock) };

    return accountsOf(this.database).createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedAccount, expected: number): Promise<{ count: number }> {
    return accountsOf(this.database).updateMany({
      where: { id: state.id, version: expected },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}

/** The accounts on the client of the unit of work, which every statement of this file goes through. */
function accountsOf(database: Database): ReturnType<Database['client']>['identityAccount'] {
  // ddd-ts-kit-disable-next-line tenancy/scoped-statement -- ADR-0001: the identity context is the control plane of the tenants, and its rows belong to none of them.
  return database.client().identityAccount;
}
