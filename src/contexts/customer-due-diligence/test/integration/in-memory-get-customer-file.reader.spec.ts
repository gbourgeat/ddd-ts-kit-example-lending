import { describe, expect, it } from '@jest/globals';
import { cursorPage, encodeCursor, offsetPage } from '@ddd-ts-kit/kernel';
import type { GetCustomerFileSort } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';
import { FakeGetCustomerFileReader } from '@/contexts/customer-due-diligence/test/fakes/get-customer-file-reader.fake';

const LINES = [{ id: 'get-customer-file-1' }, { id: 'get-customer-file-2' }, { id: 'get-customer-file-3' }];
const [first, second, third] = LINES;

describe('InMemoryGetCustomerFileReader', () => {
  it('shows only what the access scope covers: everything, nothing, some identifiers, a filter', async () => {
    const reader = new FakeGetCustomerFileReader(LINES);
    const some = await reader.search({ kind: 'ids', ids: ['get-customer-file-2'] }, offsetPage());
    const filtered = await reader.search({ kind: 'filter', filter: { id: 'get-customer-file-3' } }, offsetPage());

    expect(await reader.search({ kind: 'all' }, offsetPage())).toEqual({ items: LINES, total: 3 });
    expect(await reader.search({ kind: 'none' }, offsetPage())).toEqual({ items: [], total: 0 });
    expect(some.items).toEqual([second]);
    expect(filtered.items).toEqual([third]);
  });

  it('pages by offset in the direction of the sort, with the total', async () => {
    const reader = new FakeGetCustomerFileReader(LINES);
    const descending = offsetPage({ offset: 1, limit: 2, sort: [{ field: 'id', direction: 'desc' }] });

    expect(await reader.search({ kind: 'all' }, descending)).toEqual({ items: [second, first], total: 3 });
  });

  it('pages by cursor until the last page, which gives no cursor', async () => {
    const reader = new FakeGetCustomerFileReader(LINES);
    const opening = await reader.search({ kind: 'all' }, cursorPage<GetCustomerFileSort>({ limit: 2 }));

    const closing = await reader.search(
      { kind: 'all' },
      cursorPage<GetCustomerFileSort>({ limit: 2, cursor: opening.nextCursor ?? '' }),
    );

    expect(opening.items).toEqual([first, second]);
    expect(closing).toEqual({ items: [third] });
  });

  it('refuses a cursor that is not the cursor of a previous page', async () => {
    const reader = new FakeGetCustomerFileReader(LINES);
    const forged = cursorPage<GetCustomerFileSort>({ cursor: encodeCursor({ id: 3 }) });

    await expect(reader.search({ kind: 'all' }, forged)).rejects.toMatchObject({ code: 'INVALID_PAGE_REQUEST' });
  });

  // TODO(domain): once the reader reads the real projection, hold its production adapter to the same expectations.
  it.todo('orders by each sort field of the result, then by id');
});
