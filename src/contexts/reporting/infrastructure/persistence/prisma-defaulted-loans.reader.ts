import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { DefaultedLoansReader } from '@/contexts/reporting/application/ports/defaulted-loans-reader.port';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';
import { summariseDefaultedLoans } from '@/contexts/reporting/application/read-model/summarise-defaulted-loans';
import type { Database } from '@/platform/database/database';

/** Reads the loans in default and the payouts of the tenant from their tables of the reporting schema, and joins them. */
export class PrismaDefaultedLoansReader implements DefaultedLoansReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async read(): Promise<DefaultedLoansResult> {
    const defaulted = await this.database.client().reportingDefaultedLoan.findMany({
      where: { ...tenantWhere(this.scope) },
    });

    const principals = await this.database.client().reportingLoanPrincipal.findMany({
      where: { ...tenantWhere(this.scope) },
    });

    return summariseDefaultedLoans(
      defaulted.map((loan) => ({
        key: loan.key,
        tenantId: loan.tenantId,
        loanId: loan.loanId,
        defaultedAt: loan.defaultedAt,
      })),
      principals.map((loan) => ({
        key: loan.key,
        tenantId: loan.tenantId,
        loanId: loan.loanId,
        branchId: loan.branchId,
        principalCents: loan.principalCents,
      })),
    );
  }
}
