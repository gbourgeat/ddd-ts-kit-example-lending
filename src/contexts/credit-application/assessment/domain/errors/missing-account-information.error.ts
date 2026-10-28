import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** The assessment needs the income and expenses read from the accounts of the applicant, and none is kept on the application. */
export class MissingAccountInformation extends DomainRefusal {
  readonly code = CreditApplicationCodes.MissingAccountInformation;

  static forApplication(applicationId: string) {
    return MissingAccountInformation.refusal(
      'The account information of the application is not read yet: it is read before the assessment.',
      { applicationId },
    );
  }
}
