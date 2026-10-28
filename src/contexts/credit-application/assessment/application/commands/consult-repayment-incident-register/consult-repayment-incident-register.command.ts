import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** One party as the register was consulted for it: its name and birth date as customer-due-diligence answers them, and whether it is listed. */
export interface ConsultedParty {
  readonly customerId: string;
  readonly name: string;
  readonly birthDate: string;
  readonly listed: boolean;
}

/** The answer of the consult: the application and the answer for each of its parties. */
export interface RepaymentIncidentConsultation {
  readonly applicationId: string;
  readonly parties: readonly ConsultedParty[];
}

/** An operator of the context consults the repayment incident register for the parties of one application. */
export class ConsultRepaymentIncidentRegisterCommand extends AuthorizedCommand<RepaymentIncidentConsultation> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
