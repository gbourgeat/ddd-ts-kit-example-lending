import { IsInt, IsString, Max, Min } from 'class-validator';

/** One branch of the monthly report, as the contract declares it. Rates are in basis points, rounded down. */
export class MonthlyReportLine {
  @IsString()
  branchId = '';

  @IsString()
  month = '';

  @IsInt()
  @Min(0)
  applicationCount = 0;

  @IsInt()
  @Min(0)
  applicationAmountCents = 0;

  @IsInt()
  @Min(0)
  decisionCount = 0;

  @IsInt()
  @Min(0)
  approvalCount = 0;

  @IsInt()
  @Min(0)
  exceptionCount = 0;

  @IsInt()
  @Min(0)
  @Max(10_000)
  approvalRateBasisPoints = 0;

  @IsInt()
  @Min(0)
  @Max(10_000)
  exceptionShareBasisPoints = 0;

  @IsInt()
  @Min(0)
  @Max(10_000)
  portfolioAtRiskBasisPoints = 0;
}
