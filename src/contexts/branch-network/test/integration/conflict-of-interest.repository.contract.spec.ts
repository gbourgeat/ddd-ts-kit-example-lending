import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import { PrismaConflictOfInterestRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-conflict-of-interest.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aConflictOfInterest } from '@/contexts/branch-network/test/builders/conflict-of-interest.builder';
import { FakeConflictOfInterestRepository } from '@/contexts/branch-network/test/fakes/conflict-of-interest.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aConflictOfInterest().build(),
  idOf: (subject: ConflictOfInterest) => subject.id,
  stateOf: (subject: ConflictOfInterest) => subject.toState(),
};

repositoryContract<ConflictOfInterest>(runner, {
  ...expectations,
  name: 'FakeConflictOfInterestRepository',
  createRepository: () => new FakeConflictOfInterestRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<ConflictOfInterest>(runner, {
  ...expectations,
  name: 'PrismaConflictOfInterestRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaConflictOfInterestRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaConflictOfInterestRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaConflictOfInterestRepository(database.persistence.database, scope, clock);
    const saved = aConflictOfInterest().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
