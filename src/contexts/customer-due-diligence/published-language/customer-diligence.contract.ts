import type { CreditEligibility } from '@/contexts/customer-due-diligence/published-language/credit-eligibility';

export abstract class CustomerDiligenceContract {
  // Answers whether the customer may be lent to on the day, synchronously: refused when unknown, when the relationship ended, after a confirmed sanctions match, when rated high risk without approval, or when the due diligence is overdue.
  abstract eligibilityOf(customerId: string, asOf: string): Promise<CreditEligibility>;
}
