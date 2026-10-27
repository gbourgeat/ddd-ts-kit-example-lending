import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class LoanPaidOut extends NamedDomainEvent('servicing.loan.paid-out') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    // TODO(domain): add as readonly parameters the facts a reaction needs to know about "loan paid out" (value objects or primitives, never the aggregate itself).
  ) {
    super();
  }
}
