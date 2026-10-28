import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** A decision as the decider gives it: the outcome, its reasons and conditions in words, the amount approved and the instant. */
export interface DecisionInput {
  readonly deciderId: string;
  readonly level: string;
  readonly outcome: DecisionOutcome;
  readonly reasons: string;
  readonly conditions: string;
  readonly approvedAmountCents: number;
  readonly decidedAt: Date;
  /** Whether the decision rests on an approved exception to the policy, which lifts the limit of its decider. */
  readonly exception?: boolean;
}
