import { IsString } from 'class-validator';

export class IssueOfferParams {
  @IsString()
  id = '';
}
