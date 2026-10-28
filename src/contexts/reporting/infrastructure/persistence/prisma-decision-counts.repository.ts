import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { DecisionCounts } from '@/contexts/reporting/application/ports/decision-counts.port';
import { decisionCountCriteria } from '@/contexts/reporting/application/read-model/decision-count.criteria';
import type { DecisionCountRow } from '@/contexts/reporting/application/read-model/decision-count.row';
import type { Database } from '@/platform/database/database';

/** The decisions-per-branch read model in its table of the reporting schema, confined to the tenant of the work. */
export class PrismaDecisionCounts
  extends PrismaReadModelStore<DecisionCountRow, Prisma.TransactionClient>
  implements DecisionCounts
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: decisionCountCriteria,
      delegate: (client) => client.reportingDecisionCount,
      table: 'decision_counts',
      schema: 'reporting',
      key: 'key',
      columns: {
        key: 'key',
        tenantId: 'tenant_id',
        branchId: 'branch_id',
        month: 'month',
        decisionCount: 'decision_count',
        approvalCount: 'approval_count',
        exceptionCount: 'exception_count',
      },
      tenant: { scope },
    });
  }
}
