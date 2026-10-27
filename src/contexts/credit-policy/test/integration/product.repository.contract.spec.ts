import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import { PrismaProductRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-product.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aProduct } from '@/contexts/credit-policy/test/builders/product.builder';
import { FakeProductRepository } from '@/contexts/credit-policy/test/fakes/product.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aProduct().build(),
  idOf: (subject: Product) => subject.id,
  stateOf: (subject: Product) => subject.toState(),
};

repositoryContract<Product>(runner, {
  ...expectations,
  name: 'FakeProductRepository',
  createRepository: () => new FakeProductRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Product>(runner, {
  ...expectations,
  name: 'PrismaProductRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaProductRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaProductRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaProductRepository(database.persistence.database, scope, clock);
    const saved = aProduct().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
