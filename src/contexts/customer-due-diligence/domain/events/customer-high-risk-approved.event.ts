import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** Compliance approved a customer rated high risk; a re-rating after the approval clears it. */
export class CustomerHighRiskApproved extends NamedDomainEvent('customer-due-diligence.customer.high-risk-approved') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
