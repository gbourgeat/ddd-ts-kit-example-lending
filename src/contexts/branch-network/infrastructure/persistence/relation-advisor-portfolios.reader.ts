import type { AccessScope } from '@ddd-ts-kit/auth';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { InvalidPageRequestError, decodeCursor, encodeCursor, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { SearchAdvisorPortfoliosReader } from '@/contexts/branch-network/application/ports/search-advisor-portfolios-reader.port';
import type {
  SearchAdvisorPortfoliosItem,
  SearchAdvisorPortfoliosResult,
  SearchAdvisorPortfoliosSort,
} from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.result';

const PORTFOLIO_PREFIX = 'portfolio:';
const USER_PREFIX = 'user:';

/** Reads the portfolios an advisor holds from their advisor relations, the tuples written when a portfolio is opened. */
export class RelationAdvisorPortfoliosReader implements SearchAdvisorPortfoliosReader {
  constructor(private readonly relations: RelationTupleStore) {}

  async search(
    scope: AccessScope,
    advisorId: string,
    page: PageRequest<SearchAdvisorPortfoliosSort>,
  ): Promise<SearchAdvisorPortfoliosResult> {
    const held = await this.relations.readBySubject(`${USER_PREFIX}${advisorId}`);

    const visible = held
      .filter((tuple) => tuple.relation === 'advisor' && tuple.object.startsWith(PORTFOLIO_PREFIX))
      .map((tuple): SearchAdvisorPortfoliosItem => ({ id: tuple.object.slice(PORTFOLIO_PREFIX.length) }))
      .filter(isVisibleTo(scope))
      .sort(inOrder(page));

    const start = page.kind === 'offset' ? page.offset : positionAfter(visible, page.cursor);
    const portfolios = visible.slice(start, start + page.limit);

    if (page.kind === 'offset') {
      return pageOf(portfolios, { total: visible.length });
    }

    const last = portfolios.at(-1);

    return pageOf(
      portfolios,
      last !== undefined && start + page.limit < visible.length ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

function isVisibleTo(scope: AccessScope): (portfolio: SearchAdvisorPortfoliosItem) => boolean {
  return (portfolio) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'ids':
        return scope.ids.includes(portfolio.id);
      case 'filter':
        return Object.entries(scope.filter).every(([field, value]) => Reflect.get(portfolio, field) === value);
    }
  };
}

function inOrder(
  page: PageRequest<SearchAdvisorPortfoliosSort>,
): (left: SearchAdvisorPortfoliosItem, right: SearchAdvisorPortfoliosItem) => number {
  const toward = page.sort[0]?.direction === 'desc' ? -1 : 1;

  return (left, right) => toward * left.id.localeCompare(right.id);
}

function positionAfter(visible: readonly SearchAdvisorPortfoliosItem[], cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return visible.findIndex((portfolio) => portfolio.id === id) + 1;
}
