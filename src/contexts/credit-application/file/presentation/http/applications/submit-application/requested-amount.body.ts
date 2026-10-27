import { IsIn, IsNumber } from 'class-validator';

/** An amount as the client sends it: whole cents and the currency. The domain refuses a value that is not positive. */
export class RequestedAmountBody {
  @IsNumber()
  declare readonly cents: number;

  @IsIn(['EUR'])
  declare readonly currency: string;
}
