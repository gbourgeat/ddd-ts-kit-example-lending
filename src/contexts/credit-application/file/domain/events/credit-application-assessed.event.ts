import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The outcome the assessment proposes: a refusal is only proposed, a person reviews it before it stands. */
export type ProposedOutcome = typeof DecisionOutcome.Approve | typeof DecisionOutcome.Refuse;

/** What an assessment rests on: the inputs of the score, the model version, the score, its band, the factors that lowered it, in words, and the outcome proposed. */
export type AssessmentRecord = {
  readonly modelVersion: string;
  readonly debtToIncomePercent: number;
  readonly repaymentIncidents: number;
  readonly residualIncomeCents: number;
  readonly score: number;
  readonly band: string;
  readonly factors: readonly string[];
  readonly proposedOutcome: ProposedOutcome;
};

/** The application was assessed: what it rests on is recorded in the file, with the outcome proposed and the person who ran the assessment. */
export class CreditApplicationAssessed extends NamedDomainEvent('credit-application.credit-application.assessed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly assessment: AssessmentRecord,
    readonly assessorId: string,
  ) {
    super();
  }
}
