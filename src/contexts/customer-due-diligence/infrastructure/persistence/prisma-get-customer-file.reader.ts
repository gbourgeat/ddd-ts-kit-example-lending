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
import type { GetCustomerFileReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-file-reader.port';
import type {
  GetCustomerFileResult,
  GetCustomerFileSort,
} from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';
import type { Database } from '@/platform/database/database';

type Direction = 'asc' | 'desc';

/** Reads the customer file read model in the tenant of the work; the scope becomes a condition of the statement, never a filter in memory. */
export class PrismaGetCustomerFileReader implements GetCustomerFileReader {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async search(scope: AccessScope, page: PageRequest<GetCustomerFileSort>): Promise<GetCustomerFileResult> {
    const direction: Direction = page.sort[0]?.direction === 'desc' ? 'desc' : 'asc';
    const visible = { AND: [tenantWhere(this.scope), visibilityOf(scope)] };

    if (page.kind === 'offset') {
      const [rows, total] = await Promise.all([
        this.database.client().customerDueDiligenceCustomerFile.findMany({
          where: visible,
          orderBy: { id: direction },
          skip: page.offset,
          take: page.limit,
        }),
        this.database.client().customerDueDiligenceCustomerFile.count({ where: visible }),
      ]);

      return pageOf(
        rows.map((row) => ({ id: row.id, identifiedAt: row.identifiedAt })),
        { total },
      );
    }

    const rows = await this.database.client().customerDueDiligenceCustomerFile.findMany({
      where: { AND: [visible, cursorCondition(page.cursor, direction)] },
      orderBy: { id: direction },
      take: page.limit + 1,
    });

    const items = rows.slice(0, page.limit).map((row) => ({ id: row.id, identifiedAt: row.identifiedAt }));
    const last = items.at(-1);

    return pageOf(
      items,
      rows.length > page.limit && last !== undefined ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

/** Nothing is visible without a scope that names the customers: a filter the read model does not know yet shows nothing. */
function visibilityOf(scope: AccessScope): { readonly id?: { readonly in: string[] } } {
  switch (scope.kind) {
    case 'all':
      return {};
    case 'ids':
      return { id: { in: [...scope.ids] } };
    case 'none':
    case 'filter':
      return { id: { in: [] } };
  }
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
