import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { PersonIdentity } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

/** The directors and the beneficial owners of a business, each one identified as a person by the facts the bank checked. */
export class CustomerDirectorsAndOwnersDeclared extends NamedDomainEvent(
  'customer-due-diligence.customer.directors-and-owners-declared',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly directors: readonly PersonIdentity[],
    readonly beneficialOwners: readonly PersonIdentity[],
  ) {
    super();
  }
}
