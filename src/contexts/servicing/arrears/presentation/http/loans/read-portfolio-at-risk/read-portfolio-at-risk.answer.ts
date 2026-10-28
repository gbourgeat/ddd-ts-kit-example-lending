import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReadPortfolioAtRiskBucketAnswer } from '@/contexts/servicing/arrears/presentation/http/loans/read-portfolio-at-risk/read-portfolio-at-risk-bucket.answer';

/** The portfolio at risk of the tenant: per arrears bucket, the open loans; the principal of the open loans; the share at risk. */
export class ReadPortfolioAtRiskAnswer {
  /** One line per arrears bucket, in the order of the vocabulary. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadPortfolioAtRiskBucketAnswer)
  buckets: ReadPortfolioAtRiskBucketAnswer[] = [];

  /** The principal of the open loans, in cents. */
  @IsInt()
  openPrincipalCents = 0;

  /** The principal 31 days past due and over, over the open principal, in basis points, rounded down. */
  @IsInt()
  atRiskBasisPoints = 0;
}
