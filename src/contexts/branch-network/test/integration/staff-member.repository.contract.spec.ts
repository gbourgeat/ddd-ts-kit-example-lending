import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import { PrismaStaffMemberRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-staff-member.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';
import { FakeStaffMemberRepository } from '@/contexts/branch-network/test/fakes/staff-member.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => aStaffMember().build(),
  idOf: (subject: StaffMember) => subject.id,
  stateOf: (subject: StaffMember) => subject.toState(),
};

repositoryContract<StaffMember>(runner, {
  ...expectations,
  name: 'FakeStaffMemberRepository',
  createRepository: () => new FakeStaffMemberRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<StaffMember>(runner, {
  ...expectations,
  name: 'PrismaStaffMemberRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaStaffMemberRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaStaffMemberRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaStaffMemberRepository(database.persistence.database, scope, clock);
    const saved = aStaffMember().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
