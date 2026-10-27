import { describe, expect, it } from '@jest/globals';
import { cursorPage, encodeCursor, offsetPage } from '@ddd-ts-kit/kernel';
import type { SearchBranchStaffSort } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';
import { FakeSearchBranchStaffReader } from '@/contexts/branch-network/test/fakes/search-branch-staff-reader.fake';

const BRANCH = 'branch-1';

const LINES = [
  { id: 'staff-member-1', branchId: BRANCH, name: 'Ada' },
  { id: 'staff-member-2', branchId: BRANCH, name: 'Brice' },
  { id: 'staff-member-3', branchId: BRANCH, name: 'Chloe' },
];

const [first, second, third] = LINES;
const OTHER_BRANCH = { id: 'staff-member-4', branchId: 'branch-2', name: 'Dan' };

describe('InMemorySearchBranchStaffReader', () => {
  it('shows only what the access scope covers: everything, nothing, some identifiers, a filter', async () => {
    const reader = new FakeSearchBranchStaffReader(LINES);
    const some = await reader.search({ kind: 'ids', ids: ['staff-member-2'] }, BRANCH, offsetPage());
    const filtered = await reader.search({ kind: 'filter', filter: { name: 'Chloe' } }, BRANCH, offsetPage());

    expect(await reader.search({ kind: 'all' }, BRANCH, offsetPage())).toEqual({ items: LINES, total: 3 });
    expect(await reader.search({ kind: 'none' }, BRANCH, offsetPage())).toEqual({ items: [], total: 0 });
    expect(some.items).toEqual([second]);
    expect(filtered.items).toEqual([third]);
  });

  it('shows only the staff of the branch asked for, never another branch', async () => {
    const reader = new FakeSearchBranchStaffReader([...LINES, OTHER_BRANCH]);

    expect(await reader.search({ kind: 'all' }, 'branch-2', offsetPage())).toEqual({
      items: [OTHER_BRANCH],
      total: 1,
    });
  });

  it('pages by offset in the direction of the sort, with the total', async () => {
    const reader = new FakeSearchBranchStaffReader(LINES);
    const descending = offsetPage({ offset: 1, limit: 2, sort: [{ field: 'id', direction: 'desc' }] });

    expect(await reader.search({ kind: 'all' }, BRANCH, descending)).toEqual({ items: [second, first], total: 3 });
  });

  it('pages by cursor until the last page, which gives no cursor', async () => {
    const reader = new FakeSearchBranchStaffReader(LINES);
    const opening = await reader.search({ kind: 'all' }, BRANCH, cursorPage<SearchBranchStaffSort>({ limit: 2 }));

    const closing = await reader.search(
      { kind: 'all' },
      BRANCH,
      cursorPage<SearchBranchStaffSort>({ limit: 2, cursor: opening.nextCursor ?? '' }),
    );

    expect(opening.items).toEqual([first, second]);
    expect(closing).toEqual({ items: [third] });
  });

  it('refuses a cursor that is not the cursor of a previous page', async () => {
    const reader = new FakeSearchBranchStaffReader(LINES);
    const forged = cursorPage<SearchBranchStaffSort>({ cursor: encodeCursor({ id: 3 }) });

    await expect(reader.search({ kind: 'all' }, BRANCH, forged)).rejects.toMatchObject({
      code: 'INVALID_PAGE_REQUEST',
    });
  });

  it('orders by the identifier, the one sort field of the result', async () => {
    const reader = new FakeSearchBranchStaffReader([third, first, second]);

    expect((await reader.search({ kind: 'all' }, BRANCH, offsetPage())).items).toEqual([first, second, third]);
  });
});
