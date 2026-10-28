import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The terms an offer was drafted with, for the approved application: the price and the cost of the credit. */
export interface OfferedTerms {
  readonly applicationId: string;
  readonly amountCents: number;
  readonly durationMonths: number;
  readonly rateBasisPoints: number;
  readonly annualPercentageRateTenths: number;
  readonly instalmentCents: number;
  readonly arrangementFeeCents: number;
  readonly legalMaximumBasisPoints: number;
}

export class OfferDrafted extends NamedDomainEvent('credit-application.offer.drafted') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly terms: OfferedTerms,
  ) {
    super();
  }
}
