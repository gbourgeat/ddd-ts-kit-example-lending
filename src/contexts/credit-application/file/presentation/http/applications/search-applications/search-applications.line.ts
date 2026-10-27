import { IsNumber, IsString } from 'class-validator';

/** One application of the list as the client reads it: its identifier, its applicant and what it requests. */
export class SearchApplicationsLine {
  @IsString()
  id = '';

  @IsString()
  applicantId = '';

  @IsNumber()
  requestedAmountCents = 0;

  @IsNumber()
  durationMonths = 0;
}
