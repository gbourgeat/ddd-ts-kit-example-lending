import { IsString } from 'class-validator';

export class AcceptOfferParams {
  @IsString()
  id = '';
}
