import { IsString } from 'class-validator';

export class ContestDecisionParams {
  @IsString()
  id = '';
}
