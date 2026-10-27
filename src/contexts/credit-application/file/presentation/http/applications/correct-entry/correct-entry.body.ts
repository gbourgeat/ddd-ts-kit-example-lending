import { IsString } from 'class-validator';

/** The entry corrected, as `<application>#<position>`, and the reason of the correction. */
export class CorrectEntryBody {
  @IsString()
  entryId = '';

  @IsString()
  reason = '';
}
