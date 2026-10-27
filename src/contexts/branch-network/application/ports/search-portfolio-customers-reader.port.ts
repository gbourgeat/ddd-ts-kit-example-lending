import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchPortfolioCustomersResult,
  SearchPortfolioCustomersSort,
} from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.result';

export abstract class SearchPortfolioCustomersReader {
  abstract search(
    scope: AccessScope,
    portfolioId: string,
    page: PageRequest<SearchPortfolioCustomersSort>,
  ): Promise<SearchPortfolioCustomersResult>;
}
