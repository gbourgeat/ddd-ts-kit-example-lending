import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** A decider requested an exception to the policy on the application: the level it goes to, and the justification in words. */
export class CreditApplicationExceptionRequested extends NamedDomainEvent(
  'credit-application.credit-application.exception-requested',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly requesterId: string,
    readonly targetLevel: string,
    readonly justification: string,
  ) {
    super();
  }
}
