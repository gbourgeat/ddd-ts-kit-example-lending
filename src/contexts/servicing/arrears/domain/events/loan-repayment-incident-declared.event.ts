import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The loan is declared to the repayment incident register: two consecutive instalments are unpaid. */
export class LoanRepaymentIncidentDeclared extends NamedDomainEvent('servicing.loan.repayment-incident-declared') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
