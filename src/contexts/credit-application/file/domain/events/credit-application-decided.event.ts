import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** The decider decided the application: the outcome, its reasons or conditions in words, the amount approved, and the decider with the level it decided at. */
export class CreditApplicationDecided extends NamedDomainEvent('credit-application.credit-application.decided') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly outcome: DecisionOutcome,
    readonly deciderId: string,
    readonly level: string,
    readonly reasons: string,
    readonly conditions: string,
    readonly approvedAmountCents: number,
  ) {
    super();
  }
}
