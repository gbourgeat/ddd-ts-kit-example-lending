import { IsDateString } from 'class-validator';

/** The date the statement is read on, as an ISO instant: `?asOf=2026-03-15T00:00:00.000Z`. */
export class GetLoanStatementQueryParams {
  @IsDateString()
  asOf = '';
}
