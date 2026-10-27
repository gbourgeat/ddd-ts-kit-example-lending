import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import { PrismaBrokerRepository } from '@/contexts/brokerage/infrastructure/persistence/prisma-broker.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aBroker } from '@/contexts/brokerage/test/builders/broker.builder';
import { FakeBrokerRepository } from '@/contexts/brokerage/test/fakes/broker.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aBroker().build(),
  idOf: (subject: Broker) => subject.id,
  stateOf: (subject: Broker) => subject.toState(),
};

repositoryContract<Broker>(runner, {
  ...expectations,
  name: 'FakeBrokerRepository',
  createRepository: () => new FakeBrokerRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Broker>(runner, {
  ...expectations,
  name: 'PrismaBrokerRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaBrokerRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaBrokerRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaBrokerRepository(database.persistence.database, scope, clock);
    const saved = aBroker().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
