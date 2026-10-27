import { IsString } from 'class-validator';

export class RateGridPublishedV1Payload {
  @IsString()
  rateGridId = '';

  // Version 1 carries the identifier only: a field can join it later within this version, never rename or remove one.
}
