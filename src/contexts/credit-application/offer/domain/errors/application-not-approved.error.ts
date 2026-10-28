import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ApplicationNotApproved extends DomainRefusal {
  readonly code = CreditApplicationCodes.ApplicationNotApproved;

  static forApplication(applicationId: string) {
    return ApplicationNotApproved.refusal('The application is not approved: no offer is drafted for it.', {
      applicationId,
    }).exposing('applicationId');
  }
}
