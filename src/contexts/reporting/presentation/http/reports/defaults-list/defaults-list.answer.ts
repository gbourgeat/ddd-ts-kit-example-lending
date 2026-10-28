import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { DefaultedLoanAnswer } from '@/contexts/reporting/presentation/http/reports/defaulted-loans/defaulted-loan.answer';

/** The defaults list as the supervisor gets it: one item per loan in default, in the CSV or the JSON the request asks for. */
export class DefaultsListAnswer {
  /** One item per defaulted loan paid out on a known branch, sorted by loan. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultedLoanAnswer)
  items: DefaultedLoanAnswer[] = [];
}
