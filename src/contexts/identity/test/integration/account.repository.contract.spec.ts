import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedClock, FixedExecutionScope, executionContext, type Actor } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';
import { PrismaAccountRepository } from '@/contexts/identity/infrastructure/persistence/prisma-account.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anAccount } from '@/contexts/identity/test/builders/account.builder';
import { FakeAccountRepository } from '@/contexts/identity/test/fakes/account.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };
const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
const actor: Actor = { id: 'subject-ada', type: 'user', roles: [], attributes: {} };
const scope = new FixedExecutionScope(executionContext({ correlationId: 'contract-spec', actor, origin: 'test' }));

const expectations = {
  createAggregate: () => anAccount().build(),
  mutate: (changed: Account) => {
    changed.deactivate(new Date('2026-02-01T00:00:00.000Z'));
  },
  idOf: (subject: Account) => subject.id,
  stateOf: (subject: Account) => subject.toState(),
};

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Account>(runner, {
  ...expectations,
  name: 'FakeAccountRepository',
  createRepository: () => new FakeAccountRepository(),
});

repositoryContract<Account>(runner, {
  ...expectations,
  name: 'PrismaAccountRepository',
  createRepository: async () => {
    await database.reset();

    return new PrismaAccountRepository(database.persistence.database, scope, clock);
  },
});
