import { IsString } from 'class-validator';

export class AssignAdvisorParams {
  @IsString()
  id = '';
}
