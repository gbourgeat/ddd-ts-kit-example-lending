import { IsString } from 'class-validator';

export class DraftOfferParams {
  @IsString()
  id = '';
}
