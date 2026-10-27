import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchAdvisorPortfoliosResult,
  SearchAdvisorPortfoliosSort,
} from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.result';

/** One page of the portfolios the signed-in advisor holds, narrowed to those the actor's access scope covers. */
export class SearchAdvisorPortfoliosQuery extends AuthorizedQuery<SearchAdvisorPortfoliosResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<SearchAdvisorPortfoliosSort>,
  ) {
    super(actor);
  }
}
