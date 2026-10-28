import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { PortfolioAtRisk } from '@/contexts/reporting/application/ports/portfolio-at-risk.port';
import { portfolioAtRiskCriteria } from '@/contexts/reporting/application/read-model/portfolio-at-risk.criteria';
import type { PortfolioAtRiskRow } from '@/contexts/reporting/application/read-model/portfolio-at-risk.row';
import type { Database } from '@/platform/database/database';

/** The arrears bucket of each loan in its table of the reporting schema, confined to the tenant of the work. */
export class PrismaPortfolioAtRisk
  extends PrismaReadModelStore<PortfolioAtRiskRow, Prisma.TransactionClient>
  implements PortfolioAtRisk
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: portfolioAtRiskCriteria,
      delegate: (client) => client.reportingPortfolioAtRisk,
      table: 'portfolio_at_risk',
      schema: 'reporting',
      key: 'key',
      columns: {
        key: 'key',
        tenantId: 'tenant_id',
        loanId: 'loan_id',
        bucket: 'bucket',
      },
      tenant: { scope },
    });
  }
}
