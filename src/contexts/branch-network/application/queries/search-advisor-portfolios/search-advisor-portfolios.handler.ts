import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import type { SearchAdvisorPortfoliosReader } from '@/contexts/branch-network/application/ports/search-advisor-portfolios-reader.port';
import type { SearchAdvisorPortfoliosQuery } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.query';
import type { SearchAdvisorPortfoliosResult } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.result';

export class SearchAdvisorPortfoliosHandler implements QueryHandler<SearchAdvisorPortfoliosQuery> {
  constructor(
    private readonly reader: SearchAdvisorPortfoliosReader,
    private readonly access: Access,
  ) {}

  async execute(query: SearchAdvisorPortfoliosQuery): Promise<SearchAdvisorPortfoliosResult> {
    // The scope is asked on the portfolios, the element the advisor holds them on; the reader filters in its statement.
    const scope = await this.access.scope(
      query.actor,
      branchNetworkPermissions['portfolio.search-customers'],
      'portfolio',
    );

    return this.reader.search(scope, query.actor.id, query.page);
  }
}
