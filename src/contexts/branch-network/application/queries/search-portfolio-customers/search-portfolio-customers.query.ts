import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchPortfolioCustomersResult,
  SearchPortfolioCustomersSort,
} from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.result';

/** One page of the customers of a portfolio, narrowed to those the actor's access scope covers. */
export class SearchPortfolioCustomersQuery extends AuthorizedQuery<SearchPortfolioCustomersResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<SearchPortfolioCustomersSort>,
    readonly portfolioId: string,
  ) {
    super(actor);
  }
}
