import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadPreContractualSheetHandler } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.handler';
import { ReadPreContractualSheetQuery } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.query';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['offer.read-sheet']] },
  }),
  map: AuthorizationMap.of(requires(ReadPreContractualSheetQuery, creditApplicationPermissions['offer.read-sheet'])),
});

const holder = anActor().withRole('holder').build();

describe('Read pre contractual sheet', () => {
  it('states the price and the cost of the offer: rate, annual percentage rate, instalment and total', async () => {
    const queryBus = await arrange();

    const sheet = await queryBus.execute(new ReadPreContractualSheetQuery(holder, 'offer-1'));

    expect(sheet).toEqual({
      offerId: 'offer-1',
      applicationId: 'application-1',
      amountCents: 1_000_000,
      durationMonths: 60,
      rateBasisPoints: 590,
      annualPercentageRate: '6.1',
      instalmentCents: 19_286,
      arrangementFeeCents: 0,
      totalToRepayCents: 19_286 * 60,
    });
  });

  it('refuses an offer that does not exist, by its code', async () => {
    const queryBus = await arrange();

    await expect(queryBus.execute(new ReadPreContractualSheetQuery(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_OFFER',
    });
  });

  it('is refused to an actor who does not hold the permission offer.read-sheet', async () => {
    const queryBus = await arrange();
    const query = new ReadPreContractualSheetQuery(anActor().build(), 'offer-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const { queryBus } = createTestBuses();
  const offerRepository = new FakeOfferRepository();

  await offerRepository.save(anOffer().identifiedBy('offer-1').build());

  return queryBus
    .use(holders)
    .register(ReadPreContractualSheetQuery, new ReadPreContractualSheetHandler(offerRepository));
}
