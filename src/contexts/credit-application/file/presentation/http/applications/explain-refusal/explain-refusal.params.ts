import { IsString } from 'class-validator';

export class ExplainRefusalParams {
  @IsString()
  id = '';
}
