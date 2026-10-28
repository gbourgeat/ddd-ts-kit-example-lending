import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { OfferDrafted, type OfferedTerms } from '@/contexts/credit-application/offer/domain/events/offer-drafted.event';
import { OfferIssued } from '@/contexts/credit-application/offer/domain/events/offer-issued.event';
import { OfferAboveLegalMaximum } from '@/contexts/credit-application/offer/domain/errors/offer-above-legal-maximum.error';

const BASIS_POINTS_PER_TENTH = 10;

export interface OfferState {
  readonly registeredAt: Date;
  /** The day the offer was issued to the borrower, undefined while it is only drafted. */
  readonly issuedAt: Date | undefined;
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

    const drafted = new Offer(id, { registeredAt: now, issuedAt: undefined, terms });

    drafted.record(new OfferDrafted(id, now, terms));

    return drafted;
  }

  static rehydrate(id: string, state: OfferState): Offer {
    return new Offer(id, state);
  }

  /**
   * Issues the offer to the borrower on `now`: refused when its annual percentage rate is at or above the legal maximum
   * rate in force on that day, which the refusal carries.
   */
  issue(now: Date, legalMaximumBasisPoints: number): void {
    const { annualPercentageRateTenths } = this.state.terms;

    if (annualPercentageRateTenths * BASIS_POINTS_PER_TENTH >= legalMaximumBasisPoints) {
      throw OfferAboveLegalMaximum.forAboveLegalMaximum(annualPercentageRateTenths, legalMaximumBasisPoints);
    }

    this.state = { ...this.state, issuedAt: now };

    this.record(new OfferIssued(this.id, now, this.state.terms));
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get issuedAt(): Date | undefined {
    return this.state.issuedAt;
  }

  get terms(): OfferedTerms {
    return this.state.terms;
  }

  toState(): OfferState {
    return { ...this.state };
  }
}
