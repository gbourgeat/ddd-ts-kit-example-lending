import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';
import { PrismaRetentionPeriodRepository } from '@/contexts/data-protection/infrastructure/persistence/prisma-retention-period.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aRetentionPeriod } from '@/contexts/data-protection/test/builders/retention-period.builder';
import { FakeRetentionPeriodRepository } from '@/contexts/data-protection/test/fakes/retention-period.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aRetentionPeriod().build(),
  idOf: (subject: RetentionPeriod) => subject.id,
  stateOf: (subject: RetentionPeriod) => subject.toState(),
};

repositoryContract<RetentionPeriod>(runner, {
  ...expectations,
  name: 'FakeRetentionPeriodRepository',
  createRepository: () => new FakeRetentionPeriodRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<RetentionPeriod>(runner, {
  ...expectations,
  name: 'PrismaRetentionPeriodRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaRetentionPeriodRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaRetentionPeriodRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaRetentionPeriodRepository(database.persistence.database, scope, clock);
    const saved = aRetentionPeriod().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
