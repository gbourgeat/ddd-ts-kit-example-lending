import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import { PrismaDelegationTableRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-delegation-table.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aDelegationTable } from '@/contexts/credit-policy/test/builders/delegation-table.builder';
import { FakeDelegationTableRepository } from '@/contexts/credit-policy/test/fakes/delegation-table.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aDelegationTable().build(),
  idOf: (subject: DelegationTable) => subject.id,
  stateOf: (subject: DelegationTable) => subject.toState(),
};

repositoryContract<DelegationTable>(runner, {
  ...expectations,
  name: 'FakeDelegationTableRepository',
  createRepository: () => new FakeDelegationTableRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<DelegationTable>(runner, {
  ...expectations,
  name: 'PrismaDelegationTableRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaDelegationTableRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaDelegationTableRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaDelegationTableRepository(database.persistence.database, scope, clock);
    const saved = aDelegationTable().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
