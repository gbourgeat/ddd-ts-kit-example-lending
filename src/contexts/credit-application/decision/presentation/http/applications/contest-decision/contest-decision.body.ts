import { IsString } from 'class-validator';

export class ContestDecisionBody {
  @IsString()
  reason = '';
}
