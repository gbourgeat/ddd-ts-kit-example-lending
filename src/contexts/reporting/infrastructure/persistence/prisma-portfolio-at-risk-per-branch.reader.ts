import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { PortfolioAtRiskPerBranchReader } from '@/contexts/reporting/application/ports/portfolio-at-risk-per-branch-reader.port';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import { summarisePortfolioAtRisk } from '@/contexts/reporting/application/read-model/summarise-portfolio-at-risk';
import type { Database } from '@/platform/database/database';

/** Reads the loans paid out and the arrears of the tenant from their tables of the reporting schema, and summarises them per branch. */
export class PrismaPortfolioAtRiskPerBranchReader implements PortfolioAtRiskPerBranchReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async read(): Promise<PortfolioAtRiskPerBranchResult> {
    const principals = await this.database.client().reportingLoanPrincipal.findMany({
      where: { ...tenantWhere(this.scope) },
    });

    const arrears = await this.database.client().reportingPortfolioAtRisk.findMany({
      where: { ...tenantWhere(this.scope) },
    });

    return summarisePortfolioAtRisk(principals, arrears);
  }
}
