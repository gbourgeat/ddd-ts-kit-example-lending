import { IsInt } from 'class-validator';

/** The capital the borrower repays early, in whole cents: the fee is charged on it, not taken off it. */
export class RepayEarlyBody {
  @IsInt()
  capitalCents = 0;
}
