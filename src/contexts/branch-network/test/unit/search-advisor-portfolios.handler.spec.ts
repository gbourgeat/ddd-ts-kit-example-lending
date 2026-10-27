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
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { SearchAdvisorPortfoliosHandler } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.handler';
import { SearchAdvisorPortfoliosQuery } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.query';
import { RelationAdvisorPortfoliosReader } from '@/contexts/branch-network/infrastructure/persistence/relation-advisor-portfolios.reader';

const authorizer = new RoleBasedAuthorizer({
  roles: { holder: [branchNetworkPermissions['portfolio.search-customers']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(
    requires(SearchAdvisorPortfoliosQuery, branchNetworkPermissions['portfolio.search-customers']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Search advisor portfolios', () => {
  it('answers one page of the portfolios the signed-in advisor holds, with the total', async () => {
    const queryBus = await arrange([
      { advisor: holder.id, portfolio: 'portfolio-1' },
      { advisor: holder.id, portfolio: 'portfolio-2' },
      { advisor: holder.id, portfolio: 'portfolio-3' },
    ]);

    const page = await queryBus.execute(new SearchAdvisorPortfoliosQuery(holder, offsetPage({ limit: 2 })));

    expect(page).toEqual({ items: [{ id: 'portfolio-1' }, { id: 'portfolio-2' }], total: 3 });
  });

  it('does not list the portfolios another advisor holds', async () => {
    const queryBus = await arrange([{ advisor: 'another-advisor', portfolio: 'portfolio-9' }]);

    const page = await queryBus.execute(new SearchAdvisorPortfoliosQuery(holder, offsetPage()));

    expect(page).toEqual({ items: [], total: 0 });
  });

  it('is refused to an actor who does not hold the permission portfolio.search-customers', async () => {
    const queryBus = await arrange([{ advisor: holder.id, portfolio: 'portfolio-1' }]);
    const query = new SearchAdvisorPortfoliosQuery(anActor().build(), offsetPage());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange(holdings: readonly { advisor: string; portfolio: string }[]) {
  const { queryBus } = createTestBuses();
  const relations = new InMemoryRelationTupleStore();

  await relations.write(
    holdings.map(({ advisor, portfolio }) => ({
      object: `portfolio:${portfolio}`,
      relation: 'advisor',
      subject: `user:${advisor}`,
    })),
  );

  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new SearchAdvisorPortfoliosHandler(new RelationAdvisorPortfoliosReader(relations), access);

  return queryBus.use(holders).register(SearchAdvisorPortfoliosQuery, handler);
}
