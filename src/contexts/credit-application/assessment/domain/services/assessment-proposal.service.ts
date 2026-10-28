import type { ProposedOutcome } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import type { Money } from '@/shared-kernel/money.vo';

const GREEN_BAND = 'green';

/**
 * The outcome an assessment proposes. It proposes approve only when the band is green and the residual income is positive;
 * otherwise it proposes a refusal, which a person reviews: the machine never refuses alone.
 */
export class AssessmentProposalService {
  outcomeOf(band: string, residualIncome: Money): ProposedOutcome {
    if (band === GREEN_BAND && residualIncome.cents > 0) {
      return DecisionOutcome.Approve;
    }

    return DecisionOutcome.Refuse;
  }
}
