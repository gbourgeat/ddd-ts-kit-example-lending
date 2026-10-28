import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { GetCustomerRiskRatingResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.result';

export class GetCustomerRiskRatingQuery extends AuthorizedQuery<GetCustomerRiskRatingResult> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
