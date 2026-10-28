import type { AccessScope } from '@ddd-ts-kit/auth';
import { InvalidPageRequestError, decodeCursor, encodeCursor, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  MonthlyReportItem,
  MonthlyReportResult,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';

/**
 * One page of the lines the access scope covers, sorted by branch then cut by the page request: the same total order for an
 * offset and for a cursor, so that a cursor resumes where its page ended.
 */
export function monthlyReportPage(
  lines: readonly MonthlyReportItem[],
  scope: AccessScope,
  page: PageRequest<MonthlyReportSort>,
): MonthlyReportResult {
  const visible = lines.filter(isVisibleTo(scope)).sort(inOrder(page));
  const start = page.kind === 'offset' ? page.offset : positionAfter(visible, page.cursor);
  const branchLines = visible.slice(start, start + page.limit);

  if (page.kind === 'offset') {
    return pageOf(branchLines, { total: visible.length });
  }

  const last = branchLines.at(-1);

  return pageOf(
    branchLines,
    last !== undefined && start + page.limit < visible.length ? { nextCursor: encodeCursor({ id: last.id }) } : {},
  );
}

function isVisibleTo(scope: AccessScope): (line: MonthlyReportItem) => boolean {
  return (line) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'ids':
        return scope.ids.includes(line.id);
      case 'filter':
        return Object.entries(scope.filter).every(([field, value]) => Reflect.get(line, field) === value);
    }
  };
}

function inOrder(page: PageRequest<MonthlyReportSort>): (left: MonthlyReportItem, right: MonthlyReportItem) => number {
  const toward = page.sort[0]?.direction === 'desc' ? -1 : 1;

  return (left, right) => toward * left.id.localeCompare(right.id);
}

function positionAfter(visible: readonly MonthlyReportItem[], cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const { id } = decodeCursor(cursor);

  if (typeof id !== 'string') {
    throw new InvalidPageRequestError('The cursor of a page is the nextCursor of a previous page');
  }

  return visible.findIndex((line) => line.id === id) + 1;
}
