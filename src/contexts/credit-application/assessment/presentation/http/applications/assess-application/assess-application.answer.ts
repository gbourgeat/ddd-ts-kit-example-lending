import type { ProposedOutcome } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { IsArray, IsIn, IsInt, IsString } from 'class-validator';

/** The assessment of the application: the ratios and the register answer it rests on, the score with its model version and factors, and the outcome proposed. */
export class AssessApplicationAnswer {
  @IsString()
  applicationId = '';

  /** The version of the scoring model that gave the score. */
  @IsString()
  modelVersion = '';

  @IsInt()
  debtToIncomePercent = 0;

  @IsInt()
  repaymentIncidents = 0;

  @IsInt()
  residualIncomeCents = 0;

  @IsInt()
  score = 0;

  @IsString()
  band = '';

  /** The factors that pushed the score down, in words a customer understands. */
  @IsArray()
  @IsString({ each: true })
  factors: string[] = [];

  /** Approve, or refuse: a proposed refusal is reviewed by a person before it stands. */
  @IsIn([DecisionOutcome.Approve, DecisionOutcome.Refuse])
  proposedOutcome: ProposedOutcome = DecisionOutcome.Refuse;
}
