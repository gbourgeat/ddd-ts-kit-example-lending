import { IsString } from 'class-validator';

export class FileSuspiciousActivityReportParams {
  @IsString()
  id = '';
}
