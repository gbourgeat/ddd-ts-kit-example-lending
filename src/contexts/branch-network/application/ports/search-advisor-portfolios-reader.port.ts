import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchAdvisorPortfoliosResult,
  SearchAdvisorPortfoliosSort,
} from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.result';

export abstract class SearchAdvisorPortfoliosReader {
  abstract search(
    scope: AccessScope,
    advisorId: string,
    page: PageRequest<SearchAdvisorPortfoliosSort>,
  ): Promise<SearchAdvisorPortfoliosResult>;
}
