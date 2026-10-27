import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';
import type { Database } from '@/platform/database/database';
import {
  OfferMapper,
  type OfferColumns,
} from '@/contexts/credit-application/offer/infrastructure/persistence/offer.mapper';

type VersionedOffer = OfferColumns & { readonly version: number };

export class PrismaOfferRepository implements OfferRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Offer | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditApplicationOffer.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : OfferMapper.toDomain(row);
  }

  async save(saved: Offer): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...OfferMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedOffer): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditApplicationOffer.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedOffer, expected: number): Promise<{ count: number }> {
    return this.database.client().creditApplicationOffer.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
