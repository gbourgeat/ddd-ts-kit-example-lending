import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import type { BrokerRepository } from '@/contexts/brokerage/domain/repositories/broker.repository';
import type { Database } from '@/platform/database/database';
import { BrokerMapper, type BrokerColumns } from '@/contexts/brokerage/infrastructure/persistence/broker.mapper';

type VersionedBroker = BrokerColumns & { readonly version: number };

export class PrismaBrokerRepository implements BrokerRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Broker | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().brokerageBroker.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : BrokerMapper.toDomain(row);
  }

  async findNotLapsed(): Promise<Broker[]> {
    const rows = await this.database.client().brokerageBroker.findMany({
      where: { lapsedOn: null, ...tenantWhere(this.scope) },
    });

    return rows.map((row) => BrokerMapper.toDomain(row));
  }

  async save(saved: Broker): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...BrokerMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedBroker): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().brokerageBroker.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedBroker, expected: number): Promise<{ count: number }> {
    return this.database.client().brokerageBroker.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
