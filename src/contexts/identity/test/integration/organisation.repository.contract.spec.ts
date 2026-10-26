import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedClock, FixedExecutionScope, executionContext, type Actor } from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import { PrismaOrganisationRepository } from '@/contexts/identity/infrastructure/persistence/prisma-organisation.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anOrganisation } from '@/contexts/identity/test/builders/organisation.builder';
import { FakeOrganisationRepository } from '@/contexts/identity/test/fakes/organisation.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };
const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
const actor: Actor = { id: 'subject-ada', type: 'user', roles: [], attributes: {} };
const scope = new FixedExecutionScope(executionContext({ correlationId: 'contract-spec', actor, origin: 'test' }));

const expectations = {
  createAggregate: () => anOrganisation().build(),
  // No `mutate`: nothing changes an organisation once opened, so the stale-save case stays pending.
  idOf: (subject: Organisation) => subject.id,
  stateOf: (subject: Organisation) => subject.toState(),
};

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Organisation>(runner, {
  ...expectations,
  name: 'FakeOrganisationRepository',
  createRepository: () => new FakeOrganisationRepository(),
});

repositoryContract<Organisation>(runner, {
  ...expectations,
  name: 'PrismaOrganisationRepository',
  createRepository: async () => {
    await database.reset();

    return new PrismaOrganisationRepository(database.persistence.database, scope, clock);
  },
});
