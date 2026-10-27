import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { repositoryContract } from '@ddd-ts-kit/testing/contracts';
import type { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import { PrismaOfferRepository } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-offer.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';

const runner = { describe, it, expect, beforeEach, afterEach };

const expectations = {
  createAggregate: () => anOffer().build(),
  // TODO(domain): add `mutate: (changed: Offer) => changed.<a business method that records a change of state>(...)`, so that the suite proves an update is stored and a stale save is refused; the case stays pending until then.
  idOf: (subject: Offer) => subject.id,
  stateOf: (subject: Offer) => subject.toState(),
};

repositoryContract<Offer>(runner, {
  ...expectations,
  name: 'FakeOfferRepository',
  createRepository: () => new FakeOfferRepository(),
});

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

repositoryContract<Offer>(runner, {
  ...expectations,
  name: 'PrismaOfferRepository',
  createRepository: async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));

    return new PrismaOfferRepository(database.persistence.database, scope, clock);
  },
});

describe('PrismaOfferRepository, tenant by tenant', () => {
  it('hides from a tenant what another tenant saved', async () => {
    await database.reset();

    const scope = new FixedExecutionScope(workOf('acme'));
    const repository = new PrismaOfferRepository(database.persistence.database, scope, clock);
    const saved = anOffer().build();

    await repository.save(saved);

    scope.enter(workOf('globex'));

    expect(await repository.findById(saved.id)).toBeUndefined();
  });
});

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'contract-spec', actor, origin: 'test' });
}
