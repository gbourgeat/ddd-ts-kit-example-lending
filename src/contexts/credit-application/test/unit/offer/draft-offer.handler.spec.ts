import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import type { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { DraftOfferCommand } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.command';
import { DraftOfferHandler } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.handler';
import { aCreditApplication } from '@/contexts/credit-application/test/builders/credit-application.builder';
import { FakeOfferPricing } from '@/contexts/credit-application/test/fakes/offer-pricing.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['offer.draft']] },
  }),
  map: AuthorizationMap.of(requires(DraftOfferCommand, creditApplicationPermissions['offer.draft'])),
});

const holder = anActor().withRole('holder').build();
const march = new Date('2026-03-01T00:00:00.000Z');

/** The applications a spec knows, found by identifier. */
class KnownApplications extends CreditApplicationRepository {
  constructor(private readonly known: readonly CreditApplication[]) {
    super();
  }

  async findById(id: string): Promise<CreditApplication | undefined> {
    return this.known.find((candidate) => candidate.id === id);
  }

  async findRefusedOnOrBefore(): Promise<readonly CreditApplication[]> {
    return [];
  }

  async save(): Promise<void> {
    return undefined;
  }
}

describe('Draft offer', () => {
  it('drafts the offer at the amount approved, the duration asked and the rate of the grid in force', async () => {
    const { commandBus, offerRepository } = arrange();

    const id = await commandBus.execute(new DraftOfferCommand(holder, 'approved-1'));

    const offer = await offerRepository.findById(id);

    expect(offer?.terms).toMatchObject({
      applicationId: 'approved-1',
      amountCents: 900_000,
      durationMonths: 60,
      rateBasisPoints: 640,
      legalMaximumBasisPoints: 1_250,
    });
  });

  it('refuses an application that no decision approved, by its code', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new DraftOfferCommand(holder, 'pending-1'))).rejects.toMatchObject({
      code: 'APPLICATION_NOT_APPROVED',
    });
  });

  it('refuses an unknown application, by its code', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new DraftOfferCommand(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_CREDIT_APPLICATION',
    });
  });

  it('refuses a duration the grid does not price, by its code', async () => {
    const { commandBus } = arrange({ gridUpToMonths: 36 });

    await expect(commandBus.execute(new DraftOfferCommand(holder, 'approved-1'))).rejects.toMatchObject({
      code: 'NO_RATE_FOR_OFFER',
    });
  });

  it('refuses a draft when no legal maximum rate is known for the product, by its code', async () => {
    const { commandBus } = arrange({ maximumBasisPoints: undefined });

    await expect(commandBus.execute(new DraftOfferCommand(holder, 'approved-1'))).rejects.toMatchObject({
      code: 'UNKNOWN_LEGAL_MAXIMUM_RATE',
    });
  });

  it('refuses a draft whose annual percentage rate is above the legal maximum in force, by its code', async () => {
    const { commandBus, offerRepository } = arrange({ maximumBasisPoints: 600 });

    await expect(commandBus.execute(new DraftOfferCommand(holder, 'approved-1'))).rejects.toMatchObject({
      code: 'OFFER_ABOVE_LEGAL_MAXIMUM',
    });

    expect(await offerRepository.findById('offer-1')).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission offer.draft', async () => {
    const { commandBus } = arrange();
    const command = new DraftOfferCommand(anActor().build(), 'approved-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(given: { gridUpToMonths?: number; maximumBasisPoints?: number | undefined } = {}) {
  const { commandBus, clock, ids, dispatching } = createTestBuses({ idPrefix: 'offer', now: march });
  const offerRepository = dispatching(new FakeOfferRepository());

  const applications = new KnownApplications([
    aCreditApplication()
      .identifiedBy('approved-1')
      .forProduct('personal-loan')
      .forMonths(60)
      .approvedFor(900_000)
      .build(),
    aCreditApplication().identifiedBy('pending-1').forProduct('personal-loan').build(),
  ]);

  const handler = new DraftOfferHandler(offerRepository, {
    applications,
    pricing: pricingOf(given),
    productTerms: new FakeProductTerms(),
    ids,
    clock,
  });

  commandBus.use(holders).register(DraftOfferCommand, handler);

  return { commandBus, offerRepository };
}

function pricingOf(given: { gridUpToMonths?: number; maximumBasisPoints?: number | undefined }): FakeOfferPricing {
  const pricing = new FakeOfferPricing();
  const maximum = 'maximumBasisPoints' in given ? given.maximumBasisPoints : 1_250;

  pricing.publishGrid({
    productId: 'personal-loan',
    effectiveFrom: new Date('2026-01-01'),
    rates: [{ upToMonths: given.gridUpToMonths ?? 84, rateBasisPoints: 640 }],
  });

  if (maximum !== undefined) {
    pricing.publishMaximum({ category: 'personal', effectiveFrom: new Date('2026-01-01'), rateBasisPoints: maximum });
  }

  return pricing;
}
