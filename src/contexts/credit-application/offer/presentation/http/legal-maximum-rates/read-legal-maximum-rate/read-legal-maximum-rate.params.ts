import { IsString } from 'class-validator';

export class ReadLegalMaximumRateParams {
  @IsString()
  legalMaximumRateId = '';
}
