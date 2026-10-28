import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** The decision as the decider gives it: the outcome, its reasons or conditions in words, and the lower amount of a conditional approval. */
export interface DecisionRequest {
  readonly outcome: DecisionOutcome;
  readonly reasons: string;
  readonly conditions: string;
  readonly approvedAmountCents: number;
}

/** A staff member decides an application: the decider is the actor. */
export class DecideApplicationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly decision: DecisionRequest,
  ) {
    super(actor);
  }
}
