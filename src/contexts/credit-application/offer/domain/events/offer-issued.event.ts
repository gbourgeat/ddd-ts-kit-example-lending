import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { OfferedTerms } from '@/contexts/credit-application/offer/domain/events/offer-drafted.event';

/** The offer was issued to the borrower after its pre-contractual sheet, with the terms it was drafted with. */
export class OfferIssued extends NamedDomainEvent('credit-application.offer.issued') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly terms: OfferedTerms,
  ) {
    super();
  }
}
