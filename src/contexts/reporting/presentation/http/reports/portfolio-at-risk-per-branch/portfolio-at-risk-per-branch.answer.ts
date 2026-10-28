import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PortfolioAtRiskBranchAnswer } from '@/contexts/reporting/presentation/http/reports/portfolio-at-risk-per-branch/portfolio-at-risk-branch.answer';

export class PortfolioAtRiskPerBranchAnswer {
  /** One line per branch that paid out a loan, sorted by branch. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioAtRiskBranchAnswer)
  branches: PortfolioAtRiskBranchAnswer[] = [];
}
