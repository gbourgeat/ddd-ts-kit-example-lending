import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type {
  ProductTermsRow,
  ProductTerms,
} from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { productTermsCriteria } from '@/contexts/credit-application/file/application/projections/product-terms-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The product terms read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaProductTerms
  extends PrismaReadModelStore<ProductTermsRow, Prisma.TransactionClient>
  implements ProductTerms
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: productTermsCriteria,
      delegate: (client) => client.creditApplicationProductTerms,
      table: 'product_terms',
      schema: 'credit_application',
      key: 'productId',
      columns: {
        productId: 'product_id',
        amountMinimumCents: 'amount_minimum_cents',
        amountMaximumCents: 'amount_maximum_cents',
        durationMinimumMonths: 'duration_minimum_months',
        durationMaximumMonths: 'duration_maximum_months',
        arrangementFeeCents: 'arrangement_fee_cents',
        insuranceMandatory: 'insurance_mandatory',
      },
      tenant: { scope },
    });
  }
}
