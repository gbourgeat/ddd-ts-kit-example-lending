import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { AlreadyDecided } from '@/contexts/credit-application/file/domain/errors/already-decided.error';
import { NotAssessed } from '@/contexts/credit-application/file/domain/errors/not-assessed.error';
import { RefusalNotReviewed } from '@/contexts/credit-application/file/domain/errors/refusal-not-reviewed.error';
import { RefusalProposalStands } from '@/contexts/credit-application/file/domain/errors/refusal-proposal-stands.error';
import { InvalidDecisionReasons } from '@/contexts/credit-application/file/domain/errors/invalid-decision-reasons.error';
import { InvalidDecisionConditions } from '@/contexts/credit-application/file/domain/errors/invalid-decision-conditions.error';
import type { DecisionInput } from '@/contexts/credit-application/file/domain/values/decision-input';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/**
 * The checks of a decision against the file: decided once, assessed, a proposed refusal reviewed (a confirmed one stands
 * unless the decision refuses), the reasons of a refusal and the conditions of an approval written.
 */
export class DecisionCheckService {
  eventOf(
    aggregateId: string,
    file: {
      readonly decision: { readonly outcome: string } | undefined;
      readonly lastAssessment: { readonly proposedOutcome: string } | undefined;
      readonly refusalReviewConclusion: RefusalConclusion | undefined;
      readonly amount: { readonly cents: number };
      readonly branchId: string;
    },
    decision: DecisionInput,
  ): CreditApplicationDecided {
    if (file.decision !== undefined) {
      throw AlreadyDecided.forAlreadyDecided();
    }

    if (file.lastAssessment === undefined) {
      throw NotAssessed.forNotAssessed();
    }

    if (file.lastAssessment.proposedOutcome === DecisionOutcome.Refuse) {
      this.checkRefusalReview(file.refusalReviewConclusion, decision.outcome);
    }

    this.checkWritten(decision, file.amount.cents);

    return new CreditApplicationDecided(
      aggregateId,
      decision.decidedAt,
      decision.outcome,
      decision.deciderId,
      decision.level,
      decision.reasons,
      decision.conditions,
      decision.approvedAmountCents,
      file.branchId,
      decision.exception === true,
    );
  }

  private checkRefusalReview(conclusion: RefusalConclusion | undefined, outcome: DecisionOutcome): void {
    if (conclusion === undefined) {
      throw RefusalNotReviewed.forApplication();
    }

    if (conclusion === 'confirm' && outcome !== DecisionOutcome.Refuse) {
      throw RefusalProposalStands.forApplication();
    }
  }

  private checkWritten(decision: DecisionInput, requestedCents: number): void {
    if (decision.outcome === DecisionOutcome.Refuse && decision.reasons.trim() === '') {
      throw InvalidDecisionReasons.forReasons();
    }

    if (decision.outcome !== DecisionOutcome.ApproveWithConditions) {
      return;
    }

    const within = decision.approvedAmountCents > 0 && decision.approvedAmountCents <= requestedCents;

    if (decision.conditions.trim() === '' || !within) {
      throw InvalidDecisionConditions.forConditions();
    }
  }
}
