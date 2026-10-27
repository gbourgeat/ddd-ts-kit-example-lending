import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { PrismaScoringModelRepository } from '@/contexts/credit-scoring/infrastructure/persistence/prisma-scoring-model.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aScoringModel } from '@/contexts/credit-scoring/test/builders/scoring-model.builder';
import { FakeScoringModelRepository } from '@/contexts/credit-scoring/test/fakes/scoring-model.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aScoringModel().build(),
  // TODO(domain): add `mutate: (changed: ScoringModel) => changed.<a business method that records a change of state>(...)`, so that the suite proves an update is stored and a stale save is refused; the case stays pending until then.
  idOf: (subject: ScoringModel) => subject.id,
  stateOf: (subject: ScoringModel) => subject.toState(),
};

repositoryContract<ScoringModel>(runner, {
  ...expectations,
  name: 'FakeScoringModelRepository',
  createRepository: () => new FakeScoringModelRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<ScoringModel>(runner, {
  ...expectations,
  name: 'PrismaScoringModelRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaScoringModelRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaScoringModelRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaScoringModelRepository(database.persistence.database, scope, clock);
    const saved = aScoringModel().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
