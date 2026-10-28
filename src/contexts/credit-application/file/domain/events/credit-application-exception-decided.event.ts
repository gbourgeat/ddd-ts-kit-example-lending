import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** The credit committee decided the exception requested on the application: approved or refused, with its reasons in words, by the member who decided it. */
export class CreditApplicationExceptionDecided extends NamedDomainEvent(
  'credit-application.credit-application.exception-decided',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly outcome: DecisionOutcome,
    readonly deciderId: string,
    readonly reasons: string,
  ) {
    super();
  }
}
