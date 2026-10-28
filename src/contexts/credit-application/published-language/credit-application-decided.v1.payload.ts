import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreditApplicationDecidedV1Payload {
  @IsString()
  creditApplicationId = '';

  /** The outcome: approve, approve-with-conditions or refuse. */
  @IsString()
  outcome = '';

  /** Whether the decision is an exception to the policy, decided at the level above. */
  @IsBoolean()
  exception = false;

  /** The branch the application was submitted on: empty when none was recorded. */
  @IsString()
  branchId = '';

  /** The amount approved, in cents: zero for a refusal. */
  @IsInt()
  approvedAmountCents = 0;
}
