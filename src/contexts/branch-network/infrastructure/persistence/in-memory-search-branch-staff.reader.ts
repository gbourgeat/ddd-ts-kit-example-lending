import type { AccessScope } from '@ddd-ts-kit/auth';
import { InvalidPageRequestError, decodeCursor, encodeCursor, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { SearchBranchStaffReader } from '@/contexts/branch-network/application/ports/search-branch-staff-reader.port';
import type {
  SearchBranchStaffItem,
  SearchBranchStaffResult,
  SearchBranchStaffSort,
} from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';

export class InMemorySearchBranchStaffReader implements SearchBranchStaffReader {
  protected readonly branchStaffs: readonly SearchBranchStaffItem[] = [];

  async search(
    scope: AccessScope,
    branchId: string,
    page: PageRequest<SearchBranchStaffSort>,
  ): Promise<SearchBranchStaffResult> {
    const visible = this.branchStaffs
      .filter((branchStaff) => branchStaff.branchId === branchId && isVisibleTo(scope)(branchStaff))
      .sort(inOrder(page));

    const start = page.kind === 'offset' ? page.offset : positionAfter(visible, page.cursor);
    const branchStaffs = visible.slice(start, start + page.limit);

    if (page.kind === 'offset') {
      return pageOf(branchStaffs, { total: visible.length });
    }

    const last = branchStaffs.at(-1);

    return pageOf(
      branchStaffs,
      last !== undefined && start + page.limit < visible.length ? { nextCursor: encodeCursor({ id: last.id }) } : {},
    );
  }
}

function isVisibleTo(scope: AccessScope): (branchStaff: SearchBranchStaffItem) => boolean {
  return (branchStaff) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'ids':
        return scope.ids.includes(branchStaff.id);
      case 'filter':
        return Object.entries(scope.filter).every(([field, value]) => Reflect.get(branchStaff, field) === value);
    }
  };
}

function inOrder(
  page: PageRequest<SearchBranchStaffSort>,
): (left: SearchBranchStaffItem, right: SearchBranchStaffItem) => number {
  const toward = page.sort[0]?.direction === 'desc' ? -1 : 1;

  return (left, right) => toward * left.id.localeCompare(right.id);
}

function positionAfter(visible: readonly SearchBranchStaffItem[], cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return visible.findIndex((branchStaff) => branchStaff.id === id) + 1;
}
