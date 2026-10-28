import { IsIn, IsString } from 'class-validator';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

export class DecideExceptionBody {
  @IsIn([DecisionOutcome.Approve, DecisionOutcome.Refuse])
  outcome: DecisionOutcome = DecisionOutcome.Approve;

  @IsString()
  reasons = '';
}
