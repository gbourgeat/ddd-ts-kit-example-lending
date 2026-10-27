import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CreditApplicationSubmitted extends NamedDomainEvent('credit-application.credit-application.submitted') {
  constructor(
    readonly aggregateId: string,
    readonly applicantId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
