import { IsString } from 'class-validator';

export class RequestHumanReviewParams {
  @IsString()
  id = '';
}
