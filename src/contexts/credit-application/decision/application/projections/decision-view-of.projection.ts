import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/values/credit-application-event';
import { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';
import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';

/**
 * The view of the last decision of the file's history, in the order the file recorded it, undefined when the file holds
 * no decision. What the decider saw is what came before the decision: anything recorded after it is left out.
 */
export function decisionViewOf(
  applicationId: string,
  history: readonly CreditApplicationEvent[],
): ShowDecisionViewResult | undefined {
  const decided = lastOf(history, CreditApplicationDecided);

  if (decided === undefined) {
    return undefined;
  }

  const before = history.slice(0, history.indexOf(decided));

  return {
    applicationId,
    decision: {
      outcome: decided.outcome,
      deciderId: decided.deciderId,
      level: decided.level,
      reasons: decided.reasons,
      conditions: decided.conditions,
      approvedAmountCents: decided.approvedAmountCents,
      branchId: decided.branchId,
      exception: decided.exception,
      decidedAt: decided.occurredAt,
    },
    assessment: assessmentOf(before),
    register: registerOf(before),
    refusalReview: refusalReviewOf(before),
  };
}

function assessmentOf(before: readonly CreditApplicationEvent[]): ShowDecisionViewResult['assessment'] {
  const assessed = lastOf(before, CreditApplicationAssessed);

  if (assessed === undefined) {
    return undefined;
  }

  return { ...assessed.assessment, assessorId: assessed.assessorId, assessedAt: assessed.occurredAt };
}

function registerOf(before: readonly CreditApplicationEvent[]): ShowDecisionViewResult['register'] {
  const consulted = lastOf(before, CreditApplicationRegisterConsulted);

  if (consulted === undefined) {
    return undefined;
  }

  return { parties: consulted.parties };
}

/** The review of the last assessment only: a review given for an earlier assessment is not what the decider saw. */
function refusalReviewOf(before: readonly CreditApplicationEvent[]): ShowDecisionViewResult['refusalReview'] {
  const lastAssessment = before.findLastIndex((event) => event instanceof CreditApplicationAssessed);
  const reviewed = lastOf(before.slice(lastAssessment + 1), CreditApplicationRefusalReviewed);

  if (reviewed === undefined) {
    return undefined;
  }

  return {
    reviewerId: reviewed.reviewerId,
    conclusion: reviewed.conclusion,
    reason: reviewed.reason,
    reviewedAt: reviewed.occurredAt,
  };
}

/** The last event of the given type in the history, undefined when there is none. */
function lastOf<T extends CreditApplicationEvent>(
  history: readonly CreditApplicationEvent[],
  type: new (...args: never[]) => T,
): T | undefined {
  return history.filter((event): event is T => event instanceof type).at(-1);
}
