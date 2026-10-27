import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerBusinessRegistered extends NamedDomainEvent(
  'customer-due-diligence.customer.business-registered',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly legalName: string,
    readonly registrationNumber: string,
    readonly countryOfRegistration: string,
    readonly registeredOn: Date,
  ) {
    super();
  }
}
