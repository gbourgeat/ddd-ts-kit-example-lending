import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/** An approved exception to the policy lifts the limit of the decider who requested it, on the application it was requested for. */
export class ExceptionLimitService {
  /** Whether the exception requested on the file was approved by the committee, and the decider given is the one who requested it. */
  lifts(
    deciderId: string,
    file: {
      readonly exception: { readonly requesterId: string } | undefined;
      readonly exceptionDecision: { readonly outcome: string } | undefined;
    },
  ): boolean {
    if (file.exception === undefined || file.exceptionDecision === undefined) {
      return false;
    }

    return file.exception.requesterId === deciderId && file.exceptionDecision.outcome === DecisionOutcome.Approve;
  }
}
