import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { LoanPrincipal } from '@/contexts/reporting/application/ports/loan-principal.port';
import { loanPrincipalCriteria } from '@/contexts/reporting/application/read-model/loan-principal.criteria';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';
import type { Database } from '@/platform/database/database';

/** The branch and the amount paid out to each loan in its table of the reporting schema, confined to the tenant of the work. */
export class PrismaLoanPrincipal
  extends PrismaReadModelStore<LoanPrincipalRow, Prisma.TransactionClient>
  implements LoanPrincipal
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: loanPrincipalCriteria,
      delegate: (client) => client.reportingLoanPrincipal,
      table: 'loan_principals',
      schema: 'reporting',
      key: 'key',
      columns: {
        key: 'key',
        tenantId: 'tenant_id',
        loanId: 'loan_id',
        branchId: 'branch_id',
        principalCents: 'principal_cents',
      },
      tenant: { scope },
    });
  }
}
