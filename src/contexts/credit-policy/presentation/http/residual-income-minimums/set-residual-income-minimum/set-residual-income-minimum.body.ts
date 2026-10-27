import { IsInt } from 'class-validator';

/** Both amounts are required: a field left out stays NaN and the validator refuses it. */
export class SetResidualIncomeMinimumBody {
  /** The least amount an adult keeps each month, in whole cents; the business refuses zero and negative amounts. */
  @IsInt()
  perAdultInCents = Number.NaN;

  /** The least amount a child costs each month, in whole cents; the business refuses zero and negative amounts. */
  @IsInt()
  perChildInCents = Number.NaN;
}
