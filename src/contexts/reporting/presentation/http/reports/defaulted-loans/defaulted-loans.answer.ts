import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { DefaultedLoanAnswer } from '@/contexts/reporting/presentation/http/reports/defaulted-loans/defaulted-loan.answer';

export class DefaultedLoansAnswer {
  /** One line per defaulted loan paid out on a known branch, sorted by loan. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultedLoanAnswer)
  loans: DefaultedLoanAnswer[] = [];
}
