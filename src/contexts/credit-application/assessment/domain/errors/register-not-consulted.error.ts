import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** The assessment needs the answer of the repayment incident register, and the register is not consulted for the application yet. */
export class RegisterNotConsulted extends DomainRefusal {
  readonly code = CreditApplicationCodes.RegisterNotConsulted;

  static forApplication(applicationId: string) {
    return RegisterNotConsulted.refusal(
      'The repayment incident register is not consulted for the application yet: it is consulted before the assessment.',
      { applicationId },
    );
  }
}
