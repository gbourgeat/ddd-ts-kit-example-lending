import { IsInt, IsString } from 'class-validator';

/** The portfolio at risk of one branch: the amounts in cents, and the share at risk in basis points. */
export class PortfolioAtRiskBranchAnswer {
  @IsString()
  branchId = '';

  /** The total paid out on the branch, in cents. */
  @IsInt()
  paidOutCents = 0;

  @IsInt()
  oneToThirtyDaysCents = 0;

  @IsInt()
  thirtyOneToSixtyDaysCents = 0;

  @IsInt()
  sixtyOneToNinetyDaysCents = 0;

  @IsInt()
  overNinetyDaysCents = 0;

  /** The amount 31 days past due and over, in cents. */
  @IsInt()
  atRiskCents = 0;

  /** The share of the paid out amount at risk, in basis points, rounded down. */
  @IsInt()
  portfolioAtRiskBasisPoints = 0;
}
