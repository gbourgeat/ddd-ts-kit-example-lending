import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { PrismaPortfolioRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-portfolio.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aPortfolio } from '@/contexts/branch-network/test/builders/portfolio.builder';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aPortfolio().build(),
  idOf: (subject: Portfolio) => subject.id,
  stateOf: (subject: Portfolio) => subject.toState(),
};

repositoryContract<Portfolio>(runner, {
  ...expectations,
  name: 'FakePortfolioRepository',
  createRepository: () => new FakePortfolioRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Portfolio>(runner, {
  ...expectations,
  name: 'PrismaPortfolioRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaPortfolioRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaPortfolioRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaPortfolioRepository(database.persistence.database, scope, clock);
    const saved = aPortfolio().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
