import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import type { AssessmentRecord } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';

/**
 * What the decider saw when they decided, as the file recorded it: the decision, and the assessment, the register answer
 * and the refusal review that came before it. Nothing here is read from the current data of the bank.
 */
export interface ShowDecisionViewResult {
  readonly applicationId: string;
  readonly decision: {
    readonly outcome: DecisionOutcome;
    readonly deciderId: string;
    readonly level: string;
    readonly reasons: string;
    readonly conditions: string;
    readonly approvedAmountCents: number;
    readonly branchId: string;
    readonly exception: boolean;
    readonly decidedAt: Date;
  };
  /** The last assessment before the decision, undefined when the file holds none before it. */
  readonly assessment:
    | (AssessmentRecord & {
        readonly assessorId: string;
        readonly assessedAt: Date;
      })
    | undefined;
  /** The register answer for the parties, as consulted before the decision; undefined when never consulted. */
  readonly register:
    | {
        readonly parties: readonly { readonly customerId: string; readonly listed: boolean }[];
      }
    | undefined;
  /** The review of the assessment's refusal before the decision; undefined when no person reviewed it. */
  readonly refusalReview:
    | {
        readonly reviewerId: string;
        readonly conclusion: RefusalConclusion;
        readonly reason: string;
        readonly reviewedAt: Date;
      }
    | undefined;
}
