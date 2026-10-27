import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import { PrismaResidualIncomeMinimumRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-residual-income-minimum.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aResidualIncomeMinimum } from '@/contexts/credit-policy/test/builders/residual-income-minimum.builder';
import { FakeResidualIncomeMinimumRepository } from '@/contexts/credit-policy/test/fakes/residual-income-minimum.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aResidualIncomeMinimum().build(),
  idOf: (subject: ResidualIncomeMinimum) => subject.id,
  stateOf: (subject: ResidualIncomeMinimum) => subject.toState(),
};

repositoryContract<ResidualIncomeMinimum>(runner, {
  ...expectations,
  name: 'FakeResidualIncomeMinimumRepository',
  createRepository: () => new FakeResidualIncomeMinimumRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<ResidualIncomeMinimum>(runner, {
  ...expectations,
  name: 'PrismaResidualIncomeMinimumRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaResidualIncomeMinimumRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaResidualIncomeMinimumRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaResidualIncomeMinimumRepository(database.persistence.database, scope, clock);
    const saved = aResidualIncomeMinimum().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
