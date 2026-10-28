import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RegisterPartyLine } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/register-party.line';

/** The register answer the decider saw: for each party, whether the repayment incident register listed it. */
export class RegisterShownLine {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterPartyLine)
  parties: RegisterPartyLine[] = [];
}
