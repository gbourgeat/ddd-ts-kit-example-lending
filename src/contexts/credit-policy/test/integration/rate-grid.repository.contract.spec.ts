import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import { PrismaRateGridRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-rate-grid.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aRateGrid } from '@/contexts/credit-policy/test/builders/rate-grid.builder';
import { FakeRateGridRepository } from '@/contexts/credit-policy/test/fakes/rate-grid.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aRateGrid().build(),
  idOf: (subject: RateGrid) => subject.id,
  stateOf: (subject: RateGrid) => subject.toState(),
};

repositoryContract<RateGrid>(runner, {
  ...expectations,
  name: 'FakeRateGridRepository',
  createRepository: () => new FakeRateGridRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<RateGrid>(runner, {
  ...expectations,
  name: 'PrismaRateGridRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaRateGridRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaRateGridRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaRateGridRepository(database.persistence.database, scope, clock);
    const saved = aRateGrid().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
