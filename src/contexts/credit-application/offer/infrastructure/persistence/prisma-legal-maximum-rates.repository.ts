import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type {
  LegalMaximumRateRow,
  LegalMaximumRates,
} from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';
import { legalMaximumRateCriteria } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The legal maximum rates read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaLegalMaximumRates
  extends PrismaReadModelStore<LegalMaximumRateRow, Prisma.TransactionClient>
  implements LegalMaximumRates
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: legalMaximumRateCriteria,
      delegate: (client) => client.creditApplicationLegalMaximumRate,
      table: 'legal_maximum_rates',
      schema: 'credit_application',
      key: 'legalMaximumRateId',
      columns: {
        legalMaximumRateId: 'legal_maximum_rate_id',
        category: 'category',
        rateBasisPoints: 'rate_basis_points',
        effectiveFrom: 'effective_from',
      },
      tenant: { scope },
    });
  }
}
