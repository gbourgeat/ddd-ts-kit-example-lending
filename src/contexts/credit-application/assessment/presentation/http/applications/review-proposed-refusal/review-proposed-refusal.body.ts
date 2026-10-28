import { IsIn, IsString } from 'class-validator';

export class ReviewProposedRefusalBody {
  @IsIn(['confirm', 'overturn'])
  conclusion: 'confirm' | 'overturn' = 'confirm';

  @IsString()
  reason = '';
}
