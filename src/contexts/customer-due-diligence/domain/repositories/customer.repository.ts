import { Repository } from '@ddd-ts-kit/kernel';
import type { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';

export abstract class CustomerRepository extends Repository<Customer> {
  /** Every customer whose due diligence falls due before the instant, across all customers: the nightly flag of the overdue refreshes reads them. */
  abstract findDueBefore(instant: Date): Promise<readonly Customer[]>;

  /** Every customer whose relationship ended on or before the instant, across all customers: the nightly erasure past retention reads them. */
  abstract findEndedOnOrBefore(instant: Date): Promise<readonly Customer[]>;
}
