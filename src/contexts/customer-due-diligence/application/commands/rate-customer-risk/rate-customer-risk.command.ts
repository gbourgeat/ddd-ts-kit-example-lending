import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

/** Rates the risk of a customer, low, medium or high, from the country, the activity, the screening and the product. */
export class RateCustomerRiskCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly rating: RiskRating,
  ) {
    super(actor);
  }
}
