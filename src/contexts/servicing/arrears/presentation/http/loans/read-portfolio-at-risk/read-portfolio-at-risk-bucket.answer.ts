import { IsInt, IsString } from 'class-validator';

/** One arrears bucket of the portfolio at risk: its open loans and their principal. */
export class ReadPortfolioAtRiskBucketAnswer {
  /** The arrears bucket, as the vocabulary names it. */
  @IsString()
  bucket = '';

  /** The open loans in the bucket. */
  @IsInt()
  loans = 0;

  /** The principal of the open loans in the bucket, in cents. */
  @IsInt()
  principalCents = 0;
}
