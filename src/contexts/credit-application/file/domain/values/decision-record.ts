import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import type { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';

/** The decision taken on an application, as the file keeps it. */
export interface DecisionRecord {
  readonly outcome: DecisionOutcome;
  readonly deciderId: string;
  readonly approvedAmountCents: number;
  readonly decidedAt: Date;
}

export const DecisionRecord = {
  /** The record of a decision, read from the fact that it was decided. */
  of(event: CreditApplicationDecided): DecisionRecord {
    return {
      outcome: event.outcome,
      deciderId: event.deciderId,
      approvedAmountCents: event.approvedAmountCents,
      decidedAt: event.occurredAt,
    };
  },
};
