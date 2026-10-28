import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { IssueOfferCommand } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.command';
import { IssueOfferHandler } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.handler';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';
import { FakeOfferPricing } from '@/contexts/credit-application/test/fakes/offer-pricing.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['offer.issue']] },
  }),
  map: AuthorizationMap.of(requires(IssueOfferCommand, creditApplicationPermissions['offer.issue'])),
});

const holder = anActor().withRole('holder').build();
const april = new Date('2026-04-01T00:00:00.000Z');

describe('Issue offer', () => {
  it('issues the offer drafted for the application on the day, when its rate is under the legal maximum in force', async () => {
    const { commandBus, offerRepository } = await arrange({ maximumBasisPoints: 1_250 });

    await commandBus.execute(new IssueOfferCommand(holder, 'application-1'));

    expect((await offerRepository.findByApplicationId('application-1'))?.issuedAt).toEqual(april);
  });

  it('refuses to issue an offer whose rate is at the legal maximum in force that day, by its code', async () => {
    const { commandBus, offerRepository } = await arrange({ maximumBasisPoints: 610 });

    await expect(commandBus.execute(new IssueOfferCommand(holder, 'application-1'))).rejects.toMatchObject({
      code: 'OFFER_ABOVE_LEGAL_MAXIMUM',
    });

    expect((await offerRepository.findByApplicationId('application-1'))?.issuedAt).toBeUndefined();
  });

  it('refuses to issue an application that has no offer, by its code', async () => {
    const { commandBus } = await arrange({ maximumBasisPoints: 1_250 });

    await expect(commandBus.execute(new IssueOfferCommand(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_OFFER',
    });
  });

  it('refuses to issue an offer when no legal maximum rate is known for the product, by its code', async () => {
    const { commandBus } = await arrange({ maximumBasisPoints: undefined });

    await expect(commandBus.execute(new IssueOfferCommand(holder, 'application-1'))).rejects.toMatchObject({
      code: 'UNKNOWN_LEGAL_MAXIMUM_RATE',
    });
  });

  it('is refused to an actor who does not hold the permission offer.issue', async () => {
    const { commandBus } = await arrange({ maximumBasisPoints: 1_250 });
    const command = new IssueOfferCommand(anActor().build(), 'application-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An offer drafted for application-1, at an annual percentage rate of 6.1 per cent, and the maximum in force in April. */
async function arrange(given: { maximumBasisPoints?: number | undefined }) {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'offer', now: april });
  const offerRepository = dispatching(new FakeOfferRepository());

  await offerRepository.save(anOffer().identifiedBy('offer-1').atAnnualPercentageRate(61).underMaximum(1_250).build());

  const handler = new IssueOfferHandler(offerRepository, { pricing: pricingOf(given.maximumBasisPoints), clock });

  commandBus.use(holders).register(IssueOfferCommand, handler);

  return { commandBus, offerRepository };
}

function pricingOf(maximumBasisPoints: number | undefined): FakeOfferPricing {
  const pricing = new FakeOfferPricing();

  if (maximumBasisPoints !== undefined) {
    pricing.publishMaximum({
      category: 'personal',
      effectiveFrom: new Date('2026-01-01'),
      rateBasisPoints: maximumBasisPoints,
    });
  }

  return pricing;
}
