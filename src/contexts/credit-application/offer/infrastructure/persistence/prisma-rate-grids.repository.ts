import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type { RateGridRow, RateGrids } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';
import { rateGridCriteria } from '@/contexts/credit-application/offer/application/projections/rate-grid-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The rate grids read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaRateGrids extends PrismaReadModelStore<RateGridRow, Prisma.TransactionClient> implements RateGrids {
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: rateGridCriteria,
      delegate: (client) => client.creditApplicationRateGrid,
      table: 'rate_grids',
      schema: 'credit_application',
      key: 'rateGridId',
      columns: {
        rateGridId: 'rate_grid_id',
        productId: 'product_id',
        effectiveFrom: 'effective_from',
        rates: 'rates',
      },
      tenant: { scope },
    });
  }
}
