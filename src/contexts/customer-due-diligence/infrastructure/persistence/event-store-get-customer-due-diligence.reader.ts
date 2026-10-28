import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetCustomerDueDiligenceReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-due-diligence-reader.port';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';

/**
 * Reads the refresh dates from the customer the repository rebuilds, and hides them when the scope does not reach the customer.
 * A customer the scope reaches but the store does not hold is refused as an unknown customer.
 */
export class EventStoreGetCustomerDueDiligenceReader implements GetCustomerDueDiligenceReader {
  constructor(private readonly customers: CustomerRepository) {}

  async read(customerId: string, scope: AccessScope): Promise<GetCustomerDueDiligenceResult> {
    if (!reaches(scope, customerId)) {
      return { customerId };
    }

    const customer = await this.customers.findById(customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(customerId);
    }

    const { dueDiligenceRefreshedAt, dueDiligenceDueOn, dueDiligenceFlaggedOverdueAt } = customer.toState();

    if (dueDiligenceRefreshedAt === undefined || dueDiligenceDueOn === undefined) {
      return { customerId };
    }

    return {
      customerId,
      refreshedOn: dueDiligenceRefreshedAt.toISOString(),
      nextDueOn: dueDiligenceDueOn.toISOString(),
      ...(dueDiligenceFlaggedOverdueAt === undefined
        ? {}
        : { flaggedOverdueOn: dueDiligenceFlaggedOverdueAt.toISOString() }),
    };
  }
}

function reaches(scope: AccessScope, customerId: string): boolean {
  return scope.kind === 'all' || (scope.kind === 'ids' && scope.ids.includes(customerId));
}
