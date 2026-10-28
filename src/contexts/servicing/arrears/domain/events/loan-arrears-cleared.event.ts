import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class LoanArrearsCleared extends NamedDomainEvent('servicing.loan.arrears-cleared') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
