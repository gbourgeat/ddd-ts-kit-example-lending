import { IsString } from 'class-validator';

export class SearchAlertsLine {
  @IsString()
  id = '';

  @IsString()
  repaymentReference = '';
}
