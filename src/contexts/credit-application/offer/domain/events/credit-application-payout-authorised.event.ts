import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The payout of the application is authorised: the 8th day after signing has come, the application was not withdrawn and the customer is eligible. */
export class CreditApplicationPayoutAuthorised extends NamedDomainEvent(
  'credit-application.credit-application.payout-authorised',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
