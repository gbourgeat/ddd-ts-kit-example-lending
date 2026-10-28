import { IsString } from 'class-validator';

export class RefreshDueDiligenceParams {
  @IsString()
  id = '';
}
