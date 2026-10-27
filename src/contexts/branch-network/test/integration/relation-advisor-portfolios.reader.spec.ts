import { describe, expect, it } from '@jest/globals';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { cursorPage, encodeCursor, offsetPage } from '@ddd-ts-kit/kernel';
import type { SearchAdvisorPortfoliosSort } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.result';
import { RelationAdvisorPortfoliosReader } from '@/contexts/branch-network/infrastructure/persistence/relation-advisor-portfolios.reader';

const FIRST = { id: 'portfolio-1' };
const SECOND = { id: 'portfolio-2' };
const THIRD = { id: 'portfolio-3' };

describe('Relation advisor portfolios reader', () => {
  it('reads the portfolios of the advisor asked for, and no other', async () => {
    const relations = await advisorsOf([
      { advisor: 'advisor-1', portfolio: 'portfolio-1' },
      { advisor: 'advisor-1', portfolio: 'portfolio-2' },
      { advisor: 'advisor-2', portfolio: 'portfolio-3' },
    ]);

    const reader = new RelationAdvisorPortfoliosReader(relations);

    const page = await reader.search({ kind: 'all' }, 'advisor-1', offsetPage());

    expect(page).toEqual({ items: [FIRST, SECOND], total: 2 });
  });

  it('shows only what the access scope covers: everything, nothing, some identifiers, a filter', async () => {
    const relations = await advisorsOf([
      { advisor: 'advisor-1', portfolio: 'portfolio-1' },
      { advisor: 'advisor-1', portfolio: 'portfolio-2' },
      { advisor: 'advisor-1', portfolio: 'portfolio-3' },
    ]);

    const reader = new RelationAdvisorPortfoliosReader(relations);

    const some = await reader.search({ kind: 'ids', ids: ['portfolio-2'] }, 'advisor-1', offsetPage());
    const filtered = await reader.search({ kind: 'filter', filter: { id: 'portfolio-3' } }, 'advisor-1', offsetPage());
    const none = await reader.search({ kind: 'none' }, 'advisor-1', offsetPage());

    expect(some.items).toEqual([SECOND]);
    expect(filtered.items).toEqual([THIRD]);
    expect(none).toEqual({ items: [], total: 0 });
  });

  it('pages by cursor until the last page, which gives no cursor', async () => {
    const relations = await advisorsOf([
      { advisor: 'advisor-1', portfolio: 'portfolio-1' },
      { advisor: 'advisor-1', portfolio: 'portfolio-2' },
      { advisor: 'advisor-1', portfolio: 'portfolio-3' },
    ]);

    const reader = new RelationAdvisorPortfoliosReader(relations);

    const opening = await reader.search(
      { kind: 'all' },
      'advisor-1',
      cursorPage<SearchAdvisorPortfoliosSort>({ limit: 2 }),
    );

    const closing = await reader.search(
      { kind: 'all' },
      'advisor-1',
      cursorPage<SearchAdvisorPortfoliosSort>({ limit: 2, cursor: opening.nextCursor ?? '' }),
    );

    expect(opening.items).toEqual([FIRST, SECOND]);
    expect(closing).toEqual({ items: [THIRD] });
  });

  it('refuses a cursor that is not the cursor of a previous page', async () => {
    const relations = await advisorsOf([{ advisor: 'advisor-1', portfolio: 'portfolio-1' }]);
    const reader = new RelationAdvisorPortfoliosReader(relations);
    const forged = cursorPage<SearchAdvisorPortfoliosSort>({ cursor: encodeCursor({ id: 3 }) });

    await expect(reader.search({ kind: 'all' }, 'advisor-1', forged)).rejects.toMatchObject({
      code: 'INVALID_PAGE_REQUEST',
    });
  });
});

async function advisorsOf(
  holdings: readonly { advisor: string; portfolio: string }[],
): Promise<InMemoryRelationTupleStore> {
  const relations = new InMemoryRelationTupleStore();

  await relations.write(
    holdings.map(({ advisor, portfolio }) => ({
      object: `portfolio:${portfolio}`,
      relation: 'advisor',
      subject: `user:${advisor}`,
    })),
  );

  return relations;
}
