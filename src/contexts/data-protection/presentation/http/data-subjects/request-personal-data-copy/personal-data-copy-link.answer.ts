import { IsISO8601, IsString } from 'class-validator';

/** The link that downloads the copy of the data subject, and the instant it expires. */
export class PersonalDataCopyLink {
  /** The signed link: it downloads the copy until `expiresAt`, without any other credential. */
  @IsString()
  url = '';

  /** When the link stops working, an ISO 8601 date. */
  @IsISO8601()
  expiresAt = '';
}
