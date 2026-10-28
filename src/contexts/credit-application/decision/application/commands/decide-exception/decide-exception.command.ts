import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** The committee's decision on an exception as the decider gives it: approve or refuse, and the reasons in words. */
export interface ExceptionDecisionRequest {
  readonly outcome: DecisionOutcome;
  readonly reasons: string;
}

/** A member of the credit committee decides the exception requested on an application: the decider is the actor. */
export class DecideExceptionCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly decision: ExceptionDecisionRequest,
  ) {
    super(actor);
  }
}
