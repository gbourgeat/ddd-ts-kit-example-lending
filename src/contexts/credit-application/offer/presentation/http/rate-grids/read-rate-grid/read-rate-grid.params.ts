import { IsString } from 'class-validator';

export class ReadRateGridParams {
  @IsString()
  rateGridId = '';
}
