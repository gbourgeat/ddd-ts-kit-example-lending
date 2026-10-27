import { describe, expect, it } from '@jest/globals';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { offsetPage } from '@ddd-ts-kit/kernel';
import { RelationPortfolioCustomersReader } from '@/contexts/branch-network/infrastructure/persistence/relation-portfolio-customers.reader';

describe('Relation portfolio customers reader', () => {
  it('reads the members of the portfolio asked for, and no other', async () => {
    const relations = await membersOf('portfolio-1', ['customer-1', 'customer-2']);

    await relations.write([{ object: 'portfolio:portfolio-2', relation: 'member', subject: 'customer:customer-3' }]);
    const reader = new RelationPortfolioCustomersReader(relations);

    const page = await reader.search({ kind: 'all' }, 'portfolio-1', offsetPage());

    expect(page).toEqual({ items: [{ id: 'customer-1' }, { id: 'customer-2' }], total: 2 });
  });

  it('narrows the members to the ids the access scope covers', async () => {
    const relations = await membersOf('portfolio-1', ['customer-1', 'customer-2']);
    const reader = new RelationPortfolioCustomersReader(relations);

    const page = await reader.search({ kind: 'ids', ids: ['customer-2'] }, 'portfolio-1', offsetPage());

    expect(page).toEqual({ items: [{ id: 'customer-2' }], total: 1 });
  });

  it('answers nothing when the access scope covers none', async () => {
    const relations = await membersOf('portfolio-1', ['customer-1']);
    const reader = new RelationPortfolioCustomersReader(relations);

    const page = await reader.search({ kind: 'none' }, 'portfolio-1', offsetPage());

    expect(page).toEqual({ items: [], total: 0 });
  });
});

async function membersOf(portfolioId: string, customers: readonly string[]): Promise<InMemoryRelationTupleStore> {
  const relations = new InMemoryRelationTupleStore();

  await relations.write(
    customers.map((customer) => ({
      object: `portfolio:${portfolioId}`,
      relation: 'member',
      subject: `customer:${customer}`,
    })),
  );

  return relations;
}
