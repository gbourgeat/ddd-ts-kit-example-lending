import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

export class FakeOfferRepository extends InMemoryRepository<Offer> implements OfferRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Offer) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Offer.rehydrate(id, state),
      }),
    );
  }

  async findByApplicationId(applicationId: string): Promise<Offer | undefined> {
    const drafted = this.all().filter((offer) => offer.terms.applicationId === applicationId);

    return drafted.sort((first, second) => second.registeredAt.getTime() - first.registeredAt.getTime())[0];
  }
}
