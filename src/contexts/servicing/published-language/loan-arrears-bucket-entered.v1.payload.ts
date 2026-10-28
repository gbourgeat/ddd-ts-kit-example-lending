import { IsIn, IsString } from 'class-validator';

export class LoanArrearsBucketEnteredV1Payload {
  @IsString()
  loanId = '';

  /** The bucket the loan is now in, by its days past due: 1 to 30, 31 to 60, 61 to 90 or over 90 days. */
  @IsIn(['OneToThirtyDays', 'ThirtyOneToSixtyDays', 'SixtyOneToNinetyDays', 'OverNinetyDays'])
  bucket = 'OneToThirtyDays';
}
