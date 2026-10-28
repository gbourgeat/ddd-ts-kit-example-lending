import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetCustomerRiskRatingReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-risk-rating-reader.port';
import type { GetCustomerRiskRatingResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.result';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';

/**
 * Reads the rating from the customer the repository rebuilds, and hides it when the scope does not reach the customer.
 * A customer the scope reaches but the store does not hold is refused as an unknown customer.
 */
export class EventStoreGetCustomerRiskRatingReader implements GetCustomerRiskRatingReader {
  constructor(private readonly customers: CustomerRepository) {}

  async read(customerId: string, scope: AccessScope): Promise<GetCustomerRiskRatingResult> {
    if (!reaches(scope, customerId)) {
      return { customerId };
    }

    const customer = await this.customers.findById(customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(customerId);
    }

    const riskRating = customer.toState().riskRating;

    return riskRating === undefined ? { customerId } : { customerId, riskRating };
  }
}

function reaches(scope: AccessScope, customerId: string): boolean {
  return scope.kind === 'all' || (scope.kind === 'ids' && scope.ids.includes(customerId));
}
