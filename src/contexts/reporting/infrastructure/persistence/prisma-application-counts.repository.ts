import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { ApplicationCounts } from '@/contexts/reporting/application/ports/application-counts.port';
import { applicationCountCriteria } from '@/contexts/reporting/application/projections/application-count-criteria.projection';
import type { ApplicationCountRow } from '@/contexts/reporting/application/ports/application-counts.port';
import type { Database } from '@/platform/database/database';

/** The applications-per-branch read model in its table of the reporting schema, confined to the tenant of the work. */
export class PrismaApplicationCounts
  extends PrismaReadModelStore<ApplicationCountRow, Prisma.TransactionClient>
  implements ApplicationCounts
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: applicationCountCriteria,
      delegate: (client) => client.reportingApplicationCount,
      table: 'application_counts',
      schema: 'reporting',
      key: 'key',
      columns: {
        key: 'key',
        tenantId: 'tenant_id',
        branchId: 'branch_id',
        month: 'month',
        applicationCount: 'application_count',
        amountCents: 'amount_cents',
      },
      tenant: { scope },
    });
  }
}
