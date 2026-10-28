import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import { PrismaImpactAssessmentRepository } from '@/contexts/data-protection/infrastructure/persistence/prisma-impact-assessment.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anImpactAssessment } from '@/contexts/data-protection/test/builders/impact-assessment.builder';
import { FakeImpactAssessmentRepository } from '@/contexts/data-protection/test/fakes/impact-assessment.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => anImpactAssessment().build(),
  // TODO(domain): add `mutate: (changed: ImpactAssessment) => changed.<a business method that records a change of state>(...)`, so that the suite proves an update is stored and a stale save is refused; the case stays pending until then.
  idOf: (subject: ImpactAssessment) => subject.id,
  stateOf: (subject: ImpactAssessment) => subject.toState(),
};

repositoryContract<ImpactAssessment>(runner, {
  ...expectations,
  name: 'FakeImpactAssessmentRepository',
  createRepository: () => new FakeImpactAssessmentRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<ImpactAssessment>(runner, {
  ...expectations,
  name: 'PrismaImpactAssessmentRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaImpactAssessmentRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaImpactAssessmentRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaImpactAssessmentRepository(database.persistence.database, scope, clock);
    const saved = anImpactAssessment().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
