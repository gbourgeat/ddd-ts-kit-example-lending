import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { AcceptOfferCommand } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.command';
import { AcceptOfferHandler } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.handler';
import type { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';
import { FakeElectronicSignature } from '@/contexts/credit-application/test/fakes/electronic-signature.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['offer.accept']] },
  }),
  map: AuthorizationMap.of(requires(AcceptOfferCommand, creditApplicationPermissions['offer.accept'])),
});

const holder = anActor().withRole('holder').build();
const april = new Date('2026-04-01T00:00:00.000Z');
const signedOn = new Date('2026-04-03T10:00:00.000Z');
const tooLate = new Date('2026-04-17T10:00:00.000Z');

describe('Accept offer', () => {
  it('records the day the borrower signs the issued offer as its signing date', async () => {
    const { commandBus, offerRepository } = await arrange(signedOn, issuedOffer());

    await commandBus.execute(new AcceptOfferCommand(holder, 'offer-1'));

    expect((await offerRepository.findById('offer-1'))?.signedAt).toEqual(signedOn);
  });

  it('asks the electronic signature of the offer for the borrower who signs it', async () => {
    const { commandBus, signature } = await arrange(signedOn, issuedOffer());

    await commandBus.execute(new AcceptOfferCommand(holder, 'offer-1'));

    expect(signature.requested).toEqual([{ offerId: 'offer-1', signerId: holder.id }]);
  });

  it('refuses a signature after the fifteen days of validity, by its code, and records no signing date', async () => {
    const { commandBus, offerRepository, signature } = await arrange(tooLate, issuedOffer());

    await expect(commandBus.execute(new AcceptOfferCommand(holder, 'offer-1'))).rejects.toMatchObject({
      code: 'OFFER_EXPIRED',
    });

    expect((await offerRepository.findById('offer-1'))?.signedAt).toBeUndefined();
    expect(signature.requested).toEqual([]);
  });

  it('refuses a signature of an offer not yet issued to the borrower, by its code', async () => {
    const { commandBus } = await arrange(signedOn, draftedOffer());

    await expect(commandBus.execute(new AcceptOfferCommand(holder, 'offer-1'))).rejects.toMatchObject({
      code: 'OFFER_NOT_ISSUED',
    });
  });

  it('refuses a signature of an offer that does not exist, by its code', async () => {
    const { commandBus } = await arrange(signedOn, issuedOffer());

    await expect(commandBus.execute(new AcceptOfferCommand(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_OFFER',
    });
  });

  it('is refused to an actor who does not hold the permission offer.accept', async () => {
    const { commandBus } = await arrange(signedOn, issuedOffer());
    const command = new AcceptOfferCommand(anActor().build(), 'offer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An offer drafted and issued to the borrower on the first of April, under the legal maximum in force. */
function issuedOffer(): Offer {
  const offer = draftedOffer();

  offer.issue(april, 1_250);

  return offer;
}

function draftedOffer(): Offer {
  return anOffer().identifiedBy('offer-1').atAnnualPercentageRate(61).underMaximum(1_250).build();
}

/** The offer stored, the clock at the day of the signature, and the electronic signature the handler asks. */
async function arrange(now: Date, offer: Offer) {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'offer', now });
  const offerRepository = dispatching(new FakeOfferRepository());
  const signature = new FakeElectronicSignature();

  await offerRepository.save(offer);

  const handler = new AcceptOfferHandler(offerRepository, { signature, clock });

  commandBus.use(holders).register(AcceptOfferCommand, handler);

  return { commandBus, offerRepository, signature };
}
