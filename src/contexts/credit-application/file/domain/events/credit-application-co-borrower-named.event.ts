import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The applicant named a person as the co-borrower of the application: that person shares the debt. */
export class CreditApplicationCoBorrowerNamed extends NamedDomainEvent(
  'credit-application.credit-application.co-borrower-named',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly coBorrowerId: string,
  ) {
    super();
  }
}
