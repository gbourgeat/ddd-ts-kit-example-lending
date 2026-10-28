import { IsString } from 'class-validator';

export class ReadDeciderLevelParams {
  @IsString()
  staffMemberId = '';
}
