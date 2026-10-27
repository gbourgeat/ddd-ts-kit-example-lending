import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';
import type { Database } from '@/platform/database/database';
import {
  PortfolioMapper,
  type PortfolioColumns,
} from '@/contexts/branch-network/infrastructure/persistence/portfolio.mapper';

type VersionedPortfolio = PortfolioColumns & { readonly version: number };

export class PrismaPortfolioRepository implements PortfolioRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Portfolio | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().branchNetworkPortfolio.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : PortfolioMapper.toDomain(row);
  }

  async findByAdvisor(advisorId: string): Promise<Portfolio | undefined> {
    const row = await this.database.client().branchNetworkPortfolio.findFirst({
      where: { advisorId, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : PortfolioMapper.toDomain(row);
  }

  async save(saved: Portfolio): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...PortfolioMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedPortfolio): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().branchNetworkPortfolio.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedPortfolio, expected: number): Promise<{ count: number }> {
    return this.database.client().branchNetworkPortfolio.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
