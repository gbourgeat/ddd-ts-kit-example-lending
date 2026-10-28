import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { OfferDrafted, type OfferedTerms } from '@/contexts/credit-application/offer/domain/events/offer-drafted.event';
import { OfferIssued } from '@/contexts/credit-application/offer/domain/events/offer-issued.event';
import { OfferAboveLegalMaximum } from '@/contexts/credit-application/offer/domain/errors/offer-above-legal-maximum.error';
import { OfferAlreadyAccepted } from '@/contexts/credit-application/offer/domain/errors/offer-already-accepted.error';
import { OfferExpired } from '@/contexts/credit-application/offer/domain/errors/offer-expired.error';
import { OfferNotIssued } from '@/contexts/credit-application/offer/domain/errors/offer-not-issued.error';

const BASIS_POINTS_PER_TENTH = 10;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
/** The validity of an offer, counted from the day it was issued to the borrower. */
const VALIDITY_IN_DAYS = 15;

export interface OfferState {
  readonly registeredAt: Date;
  /** The day the offer was issued to the borrower, undefined while it is only drafted. */
  readonly issuedAt: Date | undefined;
  /** The signing date of the borrower, undefined until the offer is signed: the withdrawal and the payout count from it. */
  readonly signedAt: Date | undefined;
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

    const drafted = new Offer(id, { registeredAt: now, issuedAt: undefined, signedAt: undefined, terms });

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

  /**
   * Records the borrower's electronic signature on `now`: refused unless the offer was issued, is not signed yet, and is
   * signed within its validity of 15 days from its issue, whose expiry the refusal carries.
   */
  accept(now: Date): void {
    const { issuedAt, signedAt } = this.state;

    if (issuedAt === undefined) {
      throw OfferNotIssued.forNotIssued(this.id);
    }

    if (signedAt !== undefined) {
      throw OfferAlreadyAccepted.forAlreadyAccepted(this.id);
    }

    const expiredAt = new Date(issuedAt.getTime() + VALIDITY_IN_DAYS * MILLISECONDS_PER_DAY);

    if (now.getTime() > expiredAt.getTime()) {
      throw OfferExpired.forExpiry(this.id, expiredAt);
    }

    this.state = { ...this.state, signedAt: now };
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get issuedAt(): Date | undefined {
    return this.state.issuedAt;
  }

  get signedAt(): Date | undefined {
    return this.state.signedAt;
  }

  get terms(): OfferedTerms {
    return this.state.terms;
  }

  toState(): OfferState {
    return { ...this.state };
  }
}
