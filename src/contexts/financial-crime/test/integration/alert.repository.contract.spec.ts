import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import { PrismaAlertRepository } from '@/contexts/financial-crime/infrastructure/persistence/prisma-alert.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anAlert } from '@/contexts/financial-crime/test/builders/alert.builder';
import { FakeAlertRepository } from '@/contexts/financial-crime/test/fakes/alert.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => anAlert().build(),
  idOf: (subject: Alert) => subject.id,
  stateOf: (subject: Alert) => subject.toState(),
};

repositoryContract<Alert>(runner, {
  ...expectations,
  name: 'FakeAlertRepository',
  createRepository: () => new FakeAlertRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Alert>(runner, {
  ...expectations,
  name: 'PrismaAlertRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaAlertRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaAlertRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaAlertRepository(database.persistence.database, scope, clock);
    const saved = anAlert().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
