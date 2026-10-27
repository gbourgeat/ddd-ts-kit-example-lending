import { tenantScopeOf, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { CustomerFileProjection } from '@/contexts/customer-due-diligence/application/ports/customer-file-projection.port';
import type { Database } from '@/platform/database/database';

/** The customer file read model in its table: the row is written in the tenant of the identification, once. */
export class PrismaCustomerFileProjectionRepository implements CustomerFileProjection {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async recordIdentified(customerId: string, identifiedOn: Date): Promise<void> {
    const known = await this.database.client().customerDueDiligenceCustomerFile.findFirst({
      where: { id: customerId, ...tenantWhere(this.scope) },
    });

    if (known !== null) {
      return;
    }

    await this.database.client().customerDueDiligenceCustomerFile.createMany({
      data: [{ id: customerId, identifiedAt: identifiedOn, ...tenantScopeOf(this.scope) }],
      skipDuplicates: true,
    });
  }
}
