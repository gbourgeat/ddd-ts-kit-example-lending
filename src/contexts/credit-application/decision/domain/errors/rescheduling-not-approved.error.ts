import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** A rescheduling is decided on an approved application only: none is decided, or the decision refused it. */
export class ReschedulingNotApproved extends DomainRefusal {
  readonly code = CreditApplicationCodes.ReschedulingNotApproved;

  static forApplication(applicationId: string) {
    return ReschedulingNotApproved.refusal(
      'The application is not approved: a rescheduling is decided on an approval.',
      {
        applicationId,
      },
    ).exposing('applicationId');
  }
}
