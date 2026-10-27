import { IsString } from 'class-validator';

export class DelegationTablePublishedV1Payload {
  @IsString()
  delegationTableId = '';

  // Version 1 carries the identifier only: a field can join it later within this version, never rename or remove one.
}
