import { Repository } from '@ddd-ts-kit/kernel';
import type { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';

export abstract class OfferRepository extends Repository<Offer> {
  /** The offer drafted for an application, the most recently drafted one when several were. */
  abstract findByApplicationId(applicationId: string): Promise<Offer | undefined>;
}
