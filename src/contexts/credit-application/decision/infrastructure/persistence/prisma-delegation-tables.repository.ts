import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type {
  DelegationTableRow,
  DelegationTables,
} from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import { delegationTableCriteria } from '@/contexts/credit-application/decision/application/projections/delegation-table-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The delegation tables read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaDelegationTables
  extends PrismaReadModelStore<DelegationTableRow, Prisma.TransactionClient>
  implements DelegationTables
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: delegationTableCriteria,
      delegate: (client) => client.creditApplicationDelegationTable,
      table: 'delegation_tables',
      schema: 'credit_application',
      key: 'delegationTableId',
      columns: {
        delegationTableId: 'delegation_table_id',
        effectiveFrom: 'effective_from',
        levels: 'levels',
      },
      tenant: { scope },
    });
  }
}
