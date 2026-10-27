import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import { PrismaSuspiciousActivityReportRepository } from '@/contexts/financial-crime/infrastructure/persistence/prisma-suspicious-activity-report.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aSuspiciousActivityReport } from '@/contexts/financial-crime/test/builders/suspicious-activity-report.builder';
import { FakeSuspiciousActivityReportRepository } from '@/contexts/financial-crime/test/fakes/suspicious-activity-report.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aSuspiciousActivityReport().build(),
  idOf: (subject: SuspiciousActivityReport) => subject.id,
  stateOf: (subject: SuspiciousActivityReport) => subject.toState(),
};

repositoryContract<SuspiciousActivityReport>(runner, {
  ...expectations,
  name: 'FakeSuspiciousActivityReportRepository',
  createRepository: () => new FakeSuspiciousActivityReportRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<SuspiciousActivityReport>(runner, {
  ...expectations,
  name: 'PrismaSuspiciousActivityReportRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaSuspiciousActivityReportRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaSuspiciousActivityReportRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaSuspiciousActivityReportRepository(database.persistence.database, scope, clock);
    const saved = aSuspiciousActivityReport().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
