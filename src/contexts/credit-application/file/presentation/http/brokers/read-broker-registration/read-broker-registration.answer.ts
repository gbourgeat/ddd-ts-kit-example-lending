import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

/** The registration of a broker: whether it is in force, since when, or until when it lapsed. */
export class ReadBrokerRegistrationAnswer {
  @IsString()
  brokerId = '';

  @IsBoolean()
  inForce = false;

  @IsOptional()
  @IsDateString()
  since?: string | undefined;

  @IsOptional()
  @IsDateString()
  until?: string | undefined;
}
