import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { ConsultedPartyLine } from '@/contexts/credit-application/assessment/presentation/http/applications/consult-repayment-incident-register/consulted-party.line';

export class ConsultRepaymentIncidentRegisterAnswer {
  @IsString()
  applicationId = '';

  /** The answer of the register for each party of the application: the applicant and its co-borrowers. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsultedPartyLine)
  parties: ConsultedPartyLine[] = [];
}
