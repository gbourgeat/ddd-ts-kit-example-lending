import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplicationPayoutAuthorisedPublisher } from '@/contexts/credit-application/offer/application/integration/publishers/credit-application-payout-authorised.publisher';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';
import { Money } from '@/shared-kernel/money.vo';

describe('Publishing "credit application payout authorised" to other contexts', () => {
  it('publishes the borrower, the branch and the signed terms of the application paid out', async () => {
    const { bus, publisher } = await arrange();

    await publisher.handle(
      new CreditApplicationPayoutAuthorised('credit-application-1', new Date('2026-01-01T00:00:00.000Z')),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-application.credit-application.payout-authorised',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: {
          creditApplicationId: 'credit-application-1',
          customerId: 'customer-1',
          branchId: 'branch-1',
          amountCents: 1_000_000,
          durationMonths: 60,
          rateBasisPoints: 590,
        },
      },
    ]);
  });
});

async function arrange() {
  const bus = new InMemoryEventBus();
  const offers = new FakeOfferRepository();
  const applications = new FakeCreditApplicationRepository();

  await applications.save(
    CreditApplication.create('credit-application-1', 'customer-1', {
      amount: Money.ofCents(1_234_567),
      durationMonths: 60,
      registeredAt: new Date('2026-04-01T09:00:00.000Z'),
      branchId: 'branch-1',
    }),
  );

  await offers.save(anOffer().withApplication('credit-application-1').build());

  const publisher = new CreditApplicationPayoutAuthorisedPublisher(
    bus,
    new SequentialIdGenerator('event'),
    offers,
    applications,
  );

  return { bus, publisher };
}
