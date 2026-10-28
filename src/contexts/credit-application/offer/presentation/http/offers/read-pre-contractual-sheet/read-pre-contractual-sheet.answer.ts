import { IsInt, IsString } from 'class-validator';

export class ReadPreContractualSheetAnswer {
  @IsString()
  offerId = '';

  @IsString()
  applicationId = '';

  @IsInt()
  amountCents = 0;

  @IsInt()
  durationMonths = 0;

  /** The nominal rate of the offer, in basis points of a year. */
  @IsInt()
  rateBasisPoints = 0;

  /** The annual percentage rate, stated to one decimal of a per cent: "6.4". */
  @IsString()
  annualPercentageRate = '';

  @IsInt()
  instalmentCents = 0;

  @IsInt()
  arrangementFeeCents = 0;

  /** What the borrower pays in all: the instalments and the arrangement fee. */
  @IsInt()
  totalToRepayCents = 0;
}
