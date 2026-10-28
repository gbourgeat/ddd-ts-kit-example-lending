import { IsString } from 'class-validator';

export class ShowDecisionViewParams {
  @IsString()
  id = '';
}
