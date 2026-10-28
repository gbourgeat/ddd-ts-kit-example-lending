import { describe, expect, it } from '@jest/globals';
import { cursorPage, encodeCursor, offsetPage } from '@ddd-ts-kit/kernel';
import type {
  MonthlyReportItem,
  MonthlyReportSort,
} from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import { FakeMonthlyReportReader } from '@/contexts/reporting/test/fakes/monthly-report-reader.fake';

const MARCH = '2026-03';
const LINES = [aLine('branch-1'), aLine('branch-2'), aLine('branch-3')];
const [first, second, third] = LINES;

describe('InMemoryMonthlyReportReader', () => {
  it('shows only what the access scope covers: everything, nothing, some identifiers, a filter', async () => {
    const reader = new FakeMonthlyReportReader(LINES);
    const some = await reader.search({ kind: 'ids', ids: ['branch-2'] }, MARCH, offsetPage());
    const filtered = await reader.search({ kind: 'filter', filter: { id: 'branch-3' } }, MARCH, offsetPage());

    expect(await reader.search({ kind: 'all' }, MARCH, offsetPage())).toEqual({ items: LINES, total: 3 });
    expect(await reader.search({ kind: 'none' }, MARCH, offsetPage())).toEqual({ items: [], total: 0 });
    expect(some.items).toEqual([second]);
    expect(filtered.items).toEqual([third]);
  });

  it('answers only the lines of the month asked', async () => {
    const reader = new FakeMonthlyReportReader([...LINES, { ...aLine('branch-4'), month: '2026-04' }]);

    expect(await reader.search({ kind: 'all' }, MARCH, offsetPage())).toEqual({ items: LINES, total: 3 });
  });

  it('pages by offset in the direction of the sort, with the total', async () => {
    const reader = new FakeMonthlyReportReader(LINES);
    const descending = offsetPage({ offset: 1, limit: 2, sort: [{ field: 'id', direction: 'desc' }] });

    expect(await reader.search({ kind: 'all' }, MARCH, descending)).toEqual({ items: [second, first], total: 3 });
  });

  it('pages by cursor until the last page, which gives no cursor', async () => {
    const reader = new FakeMonthlyReportReader(LINES);
    const opening = await reader.search({ kind: 'all' }, MARCH, cursorPage<MonthlyReportSort>({ limit: 2 }));

    const closing = await reader.search(
      { kind: 'all' },
      MARCH,
      cursorPage<MonthlyReportSort>({ limit: 2, cursor: opening.nextCursor ?? '' }),
    );

    expect(opening.items).toEqual([first, second]);
    expect(closing).toEqual({ items: [third] });
  });

  it('refuses a cursor that is not the cursor of a previous page', async () => {
    const reader = new FakeMonthlyReportReader(LINES);
    const forged = cursorPage<MonthlyReportSort>({ cursor: encodeCursor({ id: 3 }) });

    await expect(reader.search({ kind: 'all' }, MARCH, forged)).rejects.toMatchObject({
      code: 'INVALID_PAGE_REQUEST',
    });
  });
});

function aLine(branchId: string): MonthlyReportItem {
  return {
    id: branchId,
    branchId,
    month: MARCH,
    applicationCount: 1,
    applicationAmountCents: 1000,
    decisionCount: 1,
    approvalCount: 1,
    exceptionCount: 0,
    approvalRateBasisPoints: 10000,
    exceptionShareBasisPoints: 0,
    portfolioAtRiskBasisPoints: 0,
  };
}
