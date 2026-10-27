import { IsISO8601 } from 'class-validator';

export class ErasePersonalDataPastRetentionBody {
  /** The instant the erasure is for, an ISO 8601 date: the period it names, never the clock of the server. */
  @IsISO8601()
  asOf = '';
}
