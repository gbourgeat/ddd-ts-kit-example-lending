import type { CatchUpSubscription, ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { ReadPortfolioAtRiskReader } from '@/contexts/servicing/arrears/application/ports/read-portfolio-at-risk-reader.port';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';
import { summarisePortfolioAtRisk } from '@/contexts/servicing/arrears/application/read-model/summarise-portfolio-at-risk';
import type { Database } from '@/platform/database/database';

/** Catches the projection up with the event store, then answers from the open rows of the tenant of the work. */
export class CatchingUpPortfolioAtRiskReader implements ReadPortfolioAtRiskReader {
  constructor(
    private readonly subscription: CatchUpSubscription,
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async read(): Promise<ReadPortfolioAtRiskResult> {
    await this.subscription.catchUp();

    const loans = await this.database.client().servicingPortfolioAtRisk.findMany({
      where: { ...tenantWhere(this.scope), open: true, deleted: false },
    });

    return summarisePortfolioAtRisk(loans);
  }
}
