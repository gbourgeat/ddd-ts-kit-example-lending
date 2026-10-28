import type { AccessScope } from '@ddd-ts-kit/auth';
import {
  InvalidPageRequestError,
  decodeCursor,
  encodeCursor,
  pageOf,
  type ExecutionScope,
  type PageRequest,
} from '@ddd-ts-kit/kernel';
import { tenantWhere } from '@ddd-ts-kit/prisma';
import type { SearchAlertsReader } from '@/contexts/financial-crime/application/ports/search-alerts-reader.port';
import type {
  SearchAlertsItem,
  SearchAlertsResult,
  SearchAlertsSort,
} from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';
import type { Database } from '@/platform/database/database';

type Direction = 'asc' | 'desc';

/** Reads the alerts of the tenant of the work. A scope that is not all shows nothing, and the statement never filters in memory. */
export class PrismaSearchAlertsReader implements SearchAlertsReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async search(scope: AccessScope, page: PageRequest<SearchAlertsSort>): Promise<SearchAlertsResult> {
    if (scope.kind !== 'all') {
      return page.kind === 'offset' ? pageOf([], { total: 0 }) : pageOf([]);
    }

    const direction: Direction = page.sort[0]?.direction === 'desc' ? 'desc' : 'asc';
    const visible = tenantWhere(this.scope);

    if (page.kind === 'offset') {
      const [rows, total] = await Promise.all([
        this.database.client().financialCrimeAlert.findMany({
          where: visible,
          orderBy: { id: direction },
          skip: page.offset,
          take: page.limit,
        }),
        this.database.client().financialCrimeAlert.count({ where: visible }),
      ]);

      return pageOf(rows.map(itemOf), { total });
    }

    const rows = await this.database.client().financialCrimeAlert.findMany({
      where: { AND: [visible, cursorCondition(page.cursor, direction)] },
      orderBy: { id: direction },
      take: page.limit + 1,
    });

    const items = rows.slice(0, page.limit).map(itemOf);
    const last = items.at(-1);

    return pageOf(
      items,
      rows.length > page.limit && last !== undefined ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

function itemOf(row: { readonly id: string; readonly repaymentReference: string }): SearchAlertsItem {
  return { id: row.id, repaymentReference: row.repaymentReference };
}

function cursorCondition(
  cursor: string | undefined,
  direction: Direction,
): { readonly id?: { readonly gt: string } | { readonly lt: string } } {
  if (cursor === undefined) {
    return {};
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return direction === 'asc' ? { id: { gt: id } } : { id: { lt: id } };
}
