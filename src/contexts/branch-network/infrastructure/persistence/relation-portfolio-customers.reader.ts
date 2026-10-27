import type { AccessScope } from '@ddd-ts-kit/auth';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { InvalidPageRequestError, decodeCursor, encodeCursor, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { SearchPortfolioCustomersReader } from '@/contexts/branch-network/application/ports/search-portfolio-customers-reader.port';
import type {
  SearchPortfolioCustomersItem,
  SearchPortfolioCustomersResult,
  SearchPortfolioCustomersSort,
} from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.result';

const CUSTOMER_PREFIX = 'customer:';

/** Reads the customers of a portfolio from its membership relations, the tuples written when a customer joins it. */
export class RelationPortfolioCustomersReader implements SearchPortfolioCustomersReader {
  constructor(private readonly relations: RelationTupleStore) {}

  async search(
    scope: AccessScope,
    portfolioId: string,
    page: PageRequest<SearchPortfolioCustomersSort>,
  ): Promise<SearchPortfolioCustomersResult> {
    const members = await this.relations.readByObject(`portfolio:${portfolioId}`, 'member');

    const visible = members
      .map((member): SearchPortfolioCustomersItem => ({ id: member.subject.slice(CUSTOMER_PREFIX.length) }))
      .filter(isVisibleTo(scope))
      .sort(inOrder(page));

    const start = page.kind === 'offset' ? page.offset : positionAfter(visible, page.cursor);
    const customers = visible.slice(start, start + page.limit);

    if (page.kind === 'offset') {
      return pageOf(customers, { total: visible.length });
    }

    const last = customers.at(-1);

    return pageOf(
      customers,
      last !== undefined && start + page.limit < visible.length ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

function isVisibleTo(scope: AccessScope): (customer: SearchPortfolioCustomersItem) => boolean {
  return (customer) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'ids':
        return scope.ids.includes(customer.id);
      case 'filter':
        return Object.entries(scope.filter).every(([field, value]) => Reflect.get(customer, field) === value);
    }
  };
}

function inOrder(
  page: PageRequest<SearchPortfolioCustomersSort>,
): (left: SearchPortfolioCustomersItem, right: SearchPortfolioCustomersItem) => number {
  const toward = page.sort[0]?.direction === 'desc' ? -1 : 1;

  return (left, right) => toward * left.id.localeCompare(right.id);
}

function positionAfter(visible: readonly SearchPortfolioCustomersItem[], cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return visible.findIndex((customer) => customer.id === id) + 1;
}
