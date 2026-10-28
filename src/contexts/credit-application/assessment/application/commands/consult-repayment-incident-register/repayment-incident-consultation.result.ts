import type { ConsultedParty } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consulted-party.result';

/** The answer of the consult: the application and the answer for each of its parties. */
export interface RepaymentIncidentConsultation {
  readonly applicationId: string;
  readonly parties: readonly ConsultedParty[];
}
