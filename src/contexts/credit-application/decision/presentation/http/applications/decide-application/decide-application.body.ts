import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

export class DecideApplicationBody {
  @IsIn([DecisionOutcome.Approve, DecisionOutcome.ApproveWithConditions, DecisionOutcome.Refuse])
  outcome: DecisionOutcome = DecisionOutcome.Approve;

  @IsString()
  reasons = '';

  @IsString()
  conditions = '';

  @IsInt()
  @Min(0)
  approvedAmountCents = 0;
}
