import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** An applicant asked for a human review of the refusal standing on the application: a person reviews it. */
export class CreditApplicationHumanReviewRequested extends NamedDomainEvent(
  'credit-application.credit-application.human-review-requested',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly requesterId: string,
  ) {
    super();
  }
}
