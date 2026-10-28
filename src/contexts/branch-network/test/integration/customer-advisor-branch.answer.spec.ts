import { describe, expect, it } from '@jest/globals';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { CustomerAdvisorBranchAnswer } from '@/contexts/branch-network/infrastructure/published-language/customer-advisor-branch.answer';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

describe('Customer advisor branch answer', () => {
  it('answers the branch of the advisor whose portfolio holds the customer', async () => {
    const { answer } = await arrange({ 'portfolio-1': 'branch-1' }, [['portfolio-1', 'customer-1']]);

    expect(await answer.branchOfCustomerAdvisor('customer-1')).toBe('branch-1');
  });

  it('answers the branch of the portfolio the customer joined, among several portfolios', async () => {
    const { answer } = await arrange({ 'portfolio-1': 'branch-1', 'portfolio-2': 'branch-2' }, [
      ['portfolio-1', 'customer-1'],
      ['portfolio-2', 'customer-2'],
    ]);

    expect(await answer.branchOfCustomerAdvisor('customer-2')).toBe('branch-2');
  });

  it('answers nothing when no advisor holds the customer', async () => {
    const { answer } = await arrange({ 'portfolio-1': 'branch-1' }, [['portfolio-1', 'customer-1']]);

    expect(await answer.branchOfCustomerAdvisor('customer-9')).toBeUndefined();
  });

  it('answers nothing when the portfolio that holds the customer is no longer known', async () => {
    const { answer } = await arrange({}, [['portfolio-gone', 'customer-1']]);

    expect(await answer.branchOfCustomerAdvisor('customer-1')).toBeUndefined();
  });
});

async function arrange(portfolios: Record<string, string>, memberships: readonly (readonly [string, string])[]) {
  const repository = new FakePortfolioRepository();

  for (const [id, branchId] of Object.entries(portfolios)) {
    await repository.save(Portfolio.create(id, `advisor-of-${id}`, branchId, new Date('2026-10-01T09:00:00Z')));
  }

  const relations = new InMemoryRelationTupleStore();

  await relations.write(
    memberships.map(([portfolioId, customerId]) => ({
      object: `portfolio:${portfolioId}`,
      relation: 'member',
      subject: `customer:${customerId}`,
    })),
  );

  return { answer: new CustomerAdvisorBranchAnswer(relations, repository) };
}
