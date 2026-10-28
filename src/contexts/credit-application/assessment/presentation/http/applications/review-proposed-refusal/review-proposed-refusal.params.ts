import { IsString } from 'class-validator';

export class ReviewProposedRefusalParams {
  @IsString()
  id = '';
}
