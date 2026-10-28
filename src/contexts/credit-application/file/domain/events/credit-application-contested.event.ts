import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The applicant contested the decision on the application, with the written point of view: the file goes before a person. */
export class CreditApplicationContested extends NamedDomainEvent('credit-application.credit-application.contested') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly requesterId: string,
    readonly reason: string,
  ) {
    super();
  }
}
