import { Repository } from '@ddd-ts-kit/kernel';
import type { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';

export abstract class OfferRepository extends Repository<Offer> {
  // TODO(domain): add only the lookups a use case needs, as abstract methods named in the ubiquitous language (for example `abstract findByNumber(number: InvoiceNumber): Promise<Offer | undefined>`); queries for screens go through a read port instead.
}
