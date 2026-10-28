import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type {
  DeciderLevelRow,
  DeciderLevels,
} from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import { deciderLevelCriteria } from '@/contexts/credit-application/decision/application/projections/decider-level-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The decider levels read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaDeciderLevels
  extends PrismaReadModelStore<DeciderLevelRow, Prisma.TransactionClient>
  implements DeciderLevels
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: deciderLevelCriteria,
      delegate: (client) => client.creditApplicationDeciderLevel,
      table: 'decider_levels',
      schema: 'credit_application',
      key: 'staffMemberId',
      columns: {
        staffMemberId: 'staff_member_id',
        branchId: 'branch_id',
        level: 'level',
      },
      tenant: { scope },
    });
  }
}
