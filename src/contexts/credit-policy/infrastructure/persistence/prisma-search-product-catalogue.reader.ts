import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { SearchProductCatalogueReader } from '@/contexts/credit-policy/application/ports/search-product-catalogue-reader.port';
import type { SearchProductCatalogueQuery } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.query';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';
import type { Database } from '@/platform/database/database';

const FIRST_PAGE = 1;

export class PrismaSearchProductCatalogueReader implements SearchProductCatalogueReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async read(query: SearchProductCatalogueQuery): Promise<SearchProductCatalogueResult> {
    const page = Math.max(query.page, FIRST_PAGE);

    const rows = await this.database.client().creditPolicyProduct.findMany({
      where: { ...tenantWhere(this.scope) },
      orderBy: { id: 'asc' },
      skip: (page - FIRST_PAGE) * query.pageSize,
      take: query.pageSize,
    });

    return {
      products: rows.map((row) => ({
        id: row.id,
        amountMinimumCents: row.amountMinimumCents,
        amountMaximumCents: row.amountMaximumCents,
        durationMinimumMonths: row.durationMinimumMonths,
        durationMaximumMonths: row.durationMaximumMonths,
        arrangementFeeCents: row.arrangementFeeCents,
        insuranceMandatory: row.insuranceMandatory,
      })),
    };
  }
}
