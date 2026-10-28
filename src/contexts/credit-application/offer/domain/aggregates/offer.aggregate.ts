import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { OfferDrafted, type OfferedTerms } from '@/contexts/credit-application/offer/domain/events/offer-drafted.event';
import { OfferAboveLegalMaximum } from '@/contexts/credit-application/offer/domain/errors/offer-above-legal-maximum.error';

const BASIS_POINTS_PER_TENTH = 10;

export interface OfferState {
  readonly registeredAt: Date;
  readonly terms: OfferedTerms;
}

export class Offer extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: OfferState,
  ) {
    super(id);
  }

  /** Drafts the offer with its price: refused when the annual percentage rate is above the legal maximum rate in force. */
  static draft(id: string, terms: OfferedTerms, now: Date): Offer {
    if (terms.annualPercentageRateTenths * BASIS_POINTS_PER_TENTH > terms.legalMaximumBasisPoints) {
      throw OfferAboveLegalMaximum.forAboveLegalMaximum(
        terms.annualPercentageRateTenths,
        terms.legalMaximumBasisPoints,
      );
    }

    const drafted = new Offer(id, { registeredAt: now, terms });

    drafted.record(new OfferDrafted(id, now, terms));

    return drafted;
  }

  static rehydrate(id: string, state: OfferState): Offer {
    return new Offer(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get terms(): OfferedTerms {
    return this.state.terms;
  }

  toState(): OfferState {
    return { ...this.state };
  }
}
