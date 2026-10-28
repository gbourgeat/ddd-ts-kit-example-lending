import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { RepaymentIncidentConsultation } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/repayment-incident-consultation.result';

/** An operator of the context consults the repayment incident register for the parties of one application. */
export class ConsultRepaymentIncidentRegisterCommand extends AuthorizedCommand<RepaymentIncidentConsultation> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
