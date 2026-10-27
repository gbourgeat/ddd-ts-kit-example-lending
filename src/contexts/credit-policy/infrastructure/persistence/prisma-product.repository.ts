import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import type { ProductRepository } from '@/contexts/credit-policy/domain/repositories/product.repository';
import type { Database } from '@/platform/database/database';
import { ProductMapper, type ProductColumns } from '@/contexts/credit-policy/infrastructure/persistence/product.mapper';

type VersionedProduct = ProductColumns & { readonly version: number };

export class PrismaProductRepository implements ProductRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Product | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditPolicyProduct.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : ProductMapper.toDomain(row);
  }

  async save(saved: Product): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...ProductMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedProduct): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditPolicyProduct.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedProduct, expected: number): Promise<{ count: number }> {
    return this.database.client().creditPolicyProduct.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
