import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

export class CreditApplicationSubmitted extends NamedDomainEvent('credit-application.credit-application.submitted') {
  constructor(
    readonly aggregateId: string,
    readonly applicantId: string,
    readonly amount: Money,
    readonly durationMonths: number,
    readonly occurredAt: Date,
    /** The branch of the advisor whose portfolio holds the applicant: never posted by the client. */
    readonly branchId: string,
  ) {
    super();
  }
}
