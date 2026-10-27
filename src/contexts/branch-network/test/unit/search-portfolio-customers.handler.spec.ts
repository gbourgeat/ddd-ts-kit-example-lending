import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { FixedClock, offsetPage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { SearchPortfolioCustomersHandler } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.handler';
import { SearchPortfolioCustomersQuery } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.query';
import { RelationPortfolioCustomersReader } from '@/contexts/branch-network/infrastructure/persistence/relation-portfolio-customers.reader';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { holder: [branchNetworkPermissions['portfolio.search-customers']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(
    requires(SearchPortfolioCustomersQuery, branchNetworkPermissions['portfolio.search-customers']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Search portfolio customers', () => {
  it('answers one page of the customers of the portfolio, with the total', async () => {
    const queryBus = await arrange(['customer-1', 'customer-2', 'customer-3']);
    const query = new SearchPortfolioCustomersQuery(holder, offsetPage({ limit: 2 }), 'portfolio-1');

    const page = await queryBus.execute(query);

    expect(page).toEqual({ items: [{ id: 'customer-1' }, { id: 'customer-2' }], total: 3 });
  });

  it('does not list the customers of another portfolio', async () => {
    const queryBus = await arrange(['customer-1']);
    const query = new SearchPortfolioCustomersQuery(holder, offsetPage(), 'portfolio-2');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'UNKNOWN_PORTFOLIO' });
  });

  it('refuses an unknown portfolio with its own code, and reads no customer', async () => {
    const queryBus = await arrange([]);
    const query = new SearchPortfolioCustomersQuery(holder, offsetPage(), 'portfolio-unknown');

    await expect(queryBus.execute(query)).rejects.toMatchObject({
      code: 'UNKNOWN_PORTFOLIO',
      facts: { portfolioId: 'portfolio-unknown' },
    });
  });

  it('is refused to an actor who does not hold the permission portfolio.search-customers', async () => {
    const queryBus = await arrange(['customer-1']);
    const query = new SearchPortfolioCustomersQuery(anActor().build(), offsetPage(), 'portfolio-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange(customers: readonly string[]) {
  const { queryBus } = createTestBuses();
  const portfolios = new FakePortfolioRepository();
  const relations = new InMemoryRelationTupleStore();

  await portfolios.save(
    Portfolio.create('portfolio-1', 'staff-member-1', 'branch-1', new Date('2026-01-01T00:00:00.000Z')),
  );

  await relations.write(
    customers.map((customer) => ({
      object: 'portfolio:portfolio-1',
      relation: 'member',
      subject: `customer:${customer}`,
    })),
  );

  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });

  const handler = new SearchPortfolioCustomersHandler(
    portfolios,
    new RelationPortfolioCustomersReader(relations),
    access,
  );

  return queryBus.use(holders).register(SearchPortfolioCustomersQuery, handler);
}
