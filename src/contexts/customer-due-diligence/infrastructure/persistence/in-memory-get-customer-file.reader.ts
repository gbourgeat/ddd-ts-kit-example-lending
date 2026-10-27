import type { AccessScope } from '@ddd-ts-kit/auth';
import { InvalidPageRequestError, decodeCursor, encodeCursor, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { GetCustomerFileReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-file-reader.port';
import type {
  GetCustomerFileItem,
  GetCustomerFileResult,
  GetCustomerFileSort,
} from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

export class InMemoryGetCustomerFileReader implements GetCustomerFileReader {
  protected readonly getCustomerFiles: readonly GetCustomerFileItem[] = [];

  async search(scope: AccessScope, page: PageRequest<GetCustomerFileSort>): Promise<GetCustomerFileResult> {
    // TODO(domain): replace these canned lines by a real read of the projection; a production adapter (SQL view, search index) implements the same port next to this file, turns the scope into a condition of its statement, and orders by the sort field then by `id` in the same direction, so that a cursor resumes on a total order.
    const visible = this.getCustomerFiles.filter(isVisibleTo(scope)).sort(inOrder(page));
    const start = page.kind === 'offset' ? page.offset : positionAfter(visible, page.cursor);
    const getCustomerFiles = visible.slice(start, start + page.limit);

    if (page.kind === 'offset') {
      return pageOf(getCustomerFiles, { total: visible.length });
    }

    const last = getCustomerFiles.at(-1);

    return pageOf(
      getCustomerFiles,
      last !== undefined && start + page.limit < visible.length ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

function isVisibleTo(scope: AccessScope): (getCustomerFile: GetCustomerFileItem) => boolean {
  return (getCustomerFile) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'ids':
        return scope.ids.includes(getCustomerFile.id);
      case 'filter':
        return Object.entries(scope.filter).every(([field, value]) => Reflect.get(getCustomerFile, field) === value);
    }
  };
}

function inOrder(
  page: PageRequest<GetCustomerFileSort>,
): (left: GetCustomerFileItem, right: GetCustomerFileItem) => number {
  const toward = page.sort[0]?.direction === 'desc' ? -1 : 1;

  return (left, right) => toward * left.id.localeCompare(right.id);
}

function positionAfter(visible: readonly GetCustomerFileItem[], cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return visible.findIndex((getCustomerFile) => getCustomerFile.id === id) + 1;
}
