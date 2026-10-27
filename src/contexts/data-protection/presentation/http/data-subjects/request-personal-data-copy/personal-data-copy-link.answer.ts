import { IsISO8601, IsString } from 'class-validator';

/** The copy the data subject asked for: its identifier, and the link that downloads it, with the instant the link expires. */
export class PersonalDataCopyLink {
  /** The identifier of the copy, the link to a fresh one-hour link is built from it. */
  @IsString()
  copyId = '';

  /** The signed link: it downloads the copy until `expiresAt`, without any other credential. */
  @IsString()
  url = '';

  /** When the link stops working, an ISO 8601 date. */
  @IsISO8601()
  expiresAt = '';
}
