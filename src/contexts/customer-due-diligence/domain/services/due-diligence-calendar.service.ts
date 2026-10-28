import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

/** How many years a due diligence stays current, by the risk rating of the customer. */
const REFRESH_CADENCE_IN_YEARS: Record<RiskRating, number> = {
  [RiskRating.High]: 1,
  [RiskRating.Medium]: 3,
  [RiskRating.Low]: 5,
};

/** A customer never rated is refreshed yearly. */
const NEVER_RATED_REFRESH_CADENCE_IN_YEARS = 1;

/** The dates of the due diligence of a customer: when it falls due again, and whether it is overdue. */
export class DueDiligenceCalendarService {
  /** The day the due diligence falls due again: the cadence of the risk rating of the customer, yearly while it is never rated. */
  dueOn(now: Date, riskRating: RiskRating | undefined): Date {
    const years =
      riskRating === undefined ? NEVER_RATED_REFRESH_CADENCE_IN_YEARS : REFRESH_CADENCE_IN_YEARS[riskRating];

    const dueOn = new Date(now.getTime());

    dueOn.setUTCFullYear(dueOn.getUTCFullYear() + years);

    return dueOn;
  }

  /** A due diligence is overdue once the day it falls due is past: the day itself is still current. */
  isOverdue(dueOn: Date, now: Date): boolean {
    return now.getTime() > dueOn.getTime();
  }
}
