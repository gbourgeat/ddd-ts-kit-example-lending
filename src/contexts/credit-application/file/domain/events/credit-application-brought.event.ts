import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** A broker brought the application on behalf of the customer it was submitted for: the broker is kept in the file, never the state. */
export class CreditApplicationBrought extends NamedDomainEvent('credit-application.credit-application.brought') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly brokerId: string,
  ) {
    super();
  }
}
