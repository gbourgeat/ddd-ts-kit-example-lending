import { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';
import { OfferNotSigned } from '@/contexts/credit-application/offer/domain/errors/offer-not-signed.error';
import { PayoutAfterWithdrawal } from '@/contexts/credit-application/offer/domain/errors/payout-after-withdrawal.error';
import { PayoutNotEligible } from '@/contexts/credit-application/offer/domain/errors/payout-not-eligible.error';
import { PayoutTooEarly } from '@/contexts/credit-application/offer/domain/errors/payout-too-early.error';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
/** The payout is authorised from the 8th day after the signing of the offer, on that day included. */
const EARLIEST_PAYOUT_DAYS = 8;

/** A payout is authorised once the 8th day after signing has come, never after a withdrawal, and only to an eligible customer. */
export class PayoutAuthorisationCheckService {
  eventOf(
    aggregateId: string,
    facts: {
      readonly withdrawn: boolean;
      readonly signedAt: Date | undefined;
      /** The reason the customer may not be lent to, undefined when the customer is eligible. */
      readonly ineligibility: string | undefined;
      readonly now: Date;
    },
  ): CreditApplicationPayoutAuthorised {
    if (facts.withdrawn) {
      throw PayoutAfterWithdrawal.forWithdrawal(aggregateId);
    }

    if (facts.signedAt === undefined) {
      throw OfferNotSigned.forNotSigned(aggregateId);
    }

    const earliest = new Date(facts.signedAt.getTime() + EARLIEST_PAYOUT_DAYS * MILLISECONDS_PER_DAY);

    if (facts.now.getTime() < earliest.getTime()) {
      throw PayoutTooEarly.forEarlyPayout(earliest);
    }

    if (facts.ineligibility !== undefined) {
      throw PayoutNotEligible.forIneligibility(facts.ineligibility);
    }

    return new CreditApplicationPayoutAuthorised(aggregateId, facts.now);
  }
}
