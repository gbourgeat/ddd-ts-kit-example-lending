import type { CreditEligibility } from '@/contexts/customer-due-diligence/published-language';

export abstract class CustomerDiligenceGateway {
  /** Whether the customer may be lent to on the day; refused with its reason when not. Asynchronous: the answer may come from another process tomorrow. */
  abstract eligibilityOf(customerId: string, asOf: Date): Promise<CreditEligibility>;
}
