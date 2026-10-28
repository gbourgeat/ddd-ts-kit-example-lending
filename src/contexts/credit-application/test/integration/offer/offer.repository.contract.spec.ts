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
  mutate: (changed: Offer) => changed.issue(new Date('2026-04-01T00:00:00.000Z'), 1_250),
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

describe('PrismaOfferRepository, the issue and the drafts of an application', () => {
  it('keeps the day an offer was issued when it is loaded again', async () => {
    await database.reset();

    const repository = new PrismaOfferRepository(database.persistence.database, scopeOf('acme'), clock);
    const offer = anOffer().identifiedBy('offer-1').build();
    const issuedOn = new Date('2026-04-01T00:00:00.000Z');

    offer.issue(issuedOn, 1_250);
    await repository.save(offer);

    expect((await repository.findById('offer-1'))?.issuedAt).toEqual(issuedOn);
  });

  it('finds the most recently drafted offer of an application', async () => {
    await database.reset();

    const repository = new PrismaOfferRepository(database.persistence.database, scopeOf('acme'), clock);

    await repository.save(anOffer().identifiedBy('offer-1').bornAt(new Date('2026-01-01T00:00:00.000Z')).build());
    await repository.save(anOffer().identifiedBy('offer-2').bornAt(new Date('2026-02-01T00:00:00.000Z')).build());

    expect((await repository.findByApplicationId('application-1'))?.id).toBe('offer-2');
  });
});

function scopeOf(tenantId: string): FixedExecutionScope {
  return new FixedExecutionScope(workOf(tenantId));
}

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
