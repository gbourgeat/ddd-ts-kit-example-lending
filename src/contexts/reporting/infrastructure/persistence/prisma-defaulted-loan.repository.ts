import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { DefaultedLoan } from '@/contexts/reporting/application/ports/defaulted-loan.port';
import { defaultedLoanCriteria } from '@/contexts/reporting/application/read-model/defaulted-loan.criteria';
import type { DefaultedLoanRow } from '@/contexts/reporting/application/read-model/defaulted-loan.row';
import type { Database } from '@/platform/database/database';

/** The loans in default in their table of the reporting schema, confined to the tenant of the work. */
export class PrismaDefaultedLoan
  extends PrismaReadModelStore<DefaultedLoanRow, Prisma.TransactionClient>
  implements DefaultedLoan
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: defaultedLoanCriteria,
      delegate: (client) => client.reportingDefaultedLoan,
      table: 'defaulted_loans',
      schema: 'reporting',
      key: 'key',
      columns: {
        key: 'key',
        tenantId: 'tenant_id',
        loanId: 'loan_id',
        defaultedAt: 'defaulted_at',
      },
      tenant: { scope },
    });
  }
}
