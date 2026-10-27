import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import { PrismaLegalMaximumRateRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-legal-maximum-rate.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aLegalMaximumRate } from '@/contexts/credit-policy/test/builders/legal-maximum-rate.builder';
import { FakeLegalMaximumRateRepository } from '@/contexts/credit-policy/test/fakes/legal-maximum-rate.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aLegalMaximumRate().build(),
  idOf: (subject: LegalMaximumRate) => subject.id,
  stateOf: (subject: LegalMaximumRate) => subject.toState(),
};

repositoryContract<LegalMaximumRate>(runner, {
  ...expectations,
  name: 'FakeLegalMaximumRateRepository',
  createRepository: () => new FakeLegalMaximumRateRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<LegalMaximumRate>(runner, {
  ...expectations,
  name: 'PrismaLegalMaximumRateRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaLegalMaximumRateRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaLegalMaximumRateRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaLegalMaximumRateRepository(database.persistence.database, scope, clock);
    const saved = aLegalMaximumRate().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });

  it('finds the rate of a category with the latest date of effect, and the rate it keeps', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaLegalMaximumRateRepository(database.persistence.database, scope, clock);

    const earlier = aLegalMaximumRate()
      .identifiedBy('rate-earlier')
      .forCategory('car')
      .atRate(1400)
      .takingEffectOn(new Date('2026-01-01T00:00:00.000Z'))
      .build();

    const later = aLegalMaximumRate()
      .identifiedBy('rate-later')
      .forCategory('car')
      .atRate(1450)
      .takingEffectOn(new Date('2026-07-01T00:00:00.000Z'))
      .build();

    await repository.save(later);
    await repository.save(earlier);

    const latest = await repository.findLatestOf('car');

    expect(latest?.id).toBe('rate-later');
    expect(latest?.rateBasisPoints).toBe(1450);
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
