import { IsString } from 'class-validator';

export class ResidualIncomeMinimumPublishedV1Payload {
  @IsString()
  residualIncomeMinimumId = '';

  // Version 1 carries the identifier only: a field can join it later within this version, never rename or remove one.
}
