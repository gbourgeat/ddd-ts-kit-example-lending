import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';
import type { PortfolioAtRisk } from '@/contexts/servicing/arrears/application/ports/portfolio-at-risk.port';
import { portfolioAtRiskCriteria } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.criteria';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';
import type { Database } from '@/platform/database/database';

/** The principal and the arrears bucket of each loan in its table of the servicing schema, confined to the tenant of the work. */
export class PrismaPortfolioAtRisk
  extends PrismaReadModelStore<PortfolioAtRiskRow, Prisma.TransactionClient>
  implements PortfolioAtRisk
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: portfolioAtRiskCriteria,
      delegate: (client) => client.servicingPortfolioAtRisk,
      table: 'portfolio_at_risk',
      schema: 'servicing',
      key: 'loanId',
      columns: {
        loanId: 'loan_id',
        bucket: 'bucket',
        open: 'open',
        principalCents: 'principal_cents',
      },
      tenant: { scope },
    });
  }
}
