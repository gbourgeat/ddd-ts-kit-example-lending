import { IsDateString } from 'class-validator';

export class FlagAllOverdueDueDiligenceBody {
  /** The instant the due diligences must fall due before to be flagged, as an ISO instant. */
  @IsDateString()
  dueBefore = '';
}
