import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { OfferPricing } from '@/contexts/credit-application/offer/application/ports/offer-pricing.port';
import { RateGridService } from '@/contexts/credit-application/offer/domain/services/rate-grid.service';
import type { Database } from '@/platform/database/database';

/** The rates column of the rate grids read model: the bands of the grid as a JSON array. */
type RatesColumn = { upToMonths: number; rateBasisPoints: number }[];

/** The pricing read from the rate grids and legal maximum rates read models of the context, confined to the tenant of the work. */
export class PrismaOfferPricing implements OfferPricing {
  private readonly schedule = new RateGridService();

  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async rateBasisPointsFor(productId: string, durationMonths: number, day: Date): Promise<number | undefined> {
    const rows = await this.database.client().creditApplicationRateGrid.findMany({
      where: { productId, deleted: false, ...tenantWhere(this.scope) },
    });

    const grid = this.schedule.inForceOn(rows, day);

    return grid === undefined ? undefined : this.schedule.bandRateOf(grid.rates as RatesColumn, durationMonths);
  }

  async legalMaximumBasisPointsFor(category: string, day: Date): Promise<number | undefined> {
    const rows = await this.database.client().creditApplicationLegalMaximumRate.findMany({
      where: { category, deleted: false, ...tenantWhere(this.scope) },
    });

    return this.schedule.inForceOn(rows, day)?.rateBasisPoints;
  }
}
