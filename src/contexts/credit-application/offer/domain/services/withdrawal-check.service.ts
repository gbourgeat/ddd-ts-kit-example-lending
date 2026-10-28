import { CreditApplicationWithdrawn } from '@/contexts/credit-application/offer/domain/events/credit-application-withdrawn.event';
import { OfferNotSigned } from '@/contexts/credit-application/offer/domain/errors/offer-not-signed.error';
import { WithdrawalAlreadyRecorded } from '@/contexts/credit-application/offer/domain/errors/withdrawal-already-recorded.error';
import { WithdrawalExpired } from '@/contexts/credit-application/offer/domain/errors/withdrawal-expired.error';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
/** The borrower withdraws within this many calendar days of the signing of the offer. */
const WITHDRAWAL_DAYS = 14;

/** A withdrawal is recorded once, needs a signed offer, and comes within 14 calendar days of its signing, on the 14th day included. */
export class WithdrawalCheckService {
  eventOf(
    aggregateId: string,
    facts: { readonly alreadyWithdrawn: boolean; readonly signedAt: Date | undefined; readonly now: Date },
  ): CreditApplicationWithdrawn {
    if (facts.alreadyWithdrawn) {
      throw WithdrawalAlreadyRecorded.forAlreadyWithdrawn(aggregateId);
    }

    if (facts.signedAt === undefined) {
      throw OfferNotSigned.forNotSigned(aggregateId);
    }

    const limit = new Date(facts.signedAt.getTime() + WITHDRAWAL_DAYS * MILLISECONDS_PER_DAY);

    if (facts.now.getTime() > limit.getTime()) {
      throw WithdrawalExpired.forExpiry(limit);
    }

    return new CreditApplicationWithdrawn(aggregateId, facts.now);
  }
}
