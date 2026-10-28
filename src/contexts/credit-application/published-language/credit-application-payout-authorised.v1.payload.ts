import { IsInt, IsString } from 'class-validator';

export class CreditApplicationPayoutAuthorisedV1Payload {
  @IsString()
  creditApplicationId = '';

  /** The borrower: the customer who applied. Their name is read from customer-due-diligence, never carried here. */
  @IsString()
  customerId = '';

  /** The branch the application was submitted on: empty when none was recorded. */
  @IsString()
  branchId = '';

  /** The amount to pay out, in cents: the amount approved. */
  @IsInt()
  amountCents = 0;

  /** The duration of the loan, in whole months. */
  @IsInt()
  durationMonths = 1;

  /** The annual rate of the offer the borrower signed, in basis points. */
  @IsInt()
  rateBasisPoints = 0;
}
