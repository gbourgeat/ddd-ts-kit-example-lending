import { IsString } from 'class-validator';

export class GetSuspiciousActivityReportAnswer {
  @IsString()
  id = '';
}
