import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The declaration of the loan to the repayment incident register is withdrawn: its arrears are paid. */
export class LoanRepaymentIncidentWithdrawn extends NamedDomainEvent('servicing.loan.repayment-incident-withdrawn') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
