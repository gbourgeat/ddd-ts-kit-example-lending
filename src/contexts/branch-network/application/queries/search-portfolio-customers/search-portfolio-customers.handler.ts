import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { UnknownPortfolio } from '@/contexts/branch-network/domain/errors/unknown-portfolio.error';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';
import type { SearchPortfolioCustomersReader } from '@/contexts/branch-network/application/ports/search-portfolio-customers-reader.port';
import type { SearchPortfolioCustomersQuery } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.query';
import type { SearchPortfolioCustomersResult } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.result';

export class SearchPortfolioCustomersHandler implements QueryHandler<SearchPortfolioCustomersQuery> {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly reader: SearchPortfolioCustomersReader,
    private readonly access: Access,
  ) {}

  async execute(query: SearchPortfolioCustomersQuery): Promise<SearchPortfolioCustomersResult> {
    const portfolio = await this.portfolioRepository.findById(query.portfolioId);

    if (!portfolio) {
      throw UnknownPortfolio.forPortfolio(query.portfolioId);
    }

    const scope = await this.access.scope(
      query.actor,
      branchNetworkPermissions['portfolio.search-customers'],
      'customer',
    );

    return this.reader.search(scope, portfolio.id, query.page);
  }
}
