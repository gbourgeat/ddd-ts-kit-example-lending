import { IsString } from 'class-validator';

export class GetSuspiciousActivityReportParams {
  @IsString()
  id = '';
}
