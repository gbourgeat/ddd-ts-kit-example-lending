import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** No score can be given: no version of the scoring model is published yet. */
export class NoScoreAvailable extends DomainRefusal {
  readonly code = CreditApplicationCodes.NoScoreAvailable;

  static forScore(applicationId: string) {
    return NoScoreAvailable.refusal(
      'No score can be given to the application: no version of the scoring model is published yet.',
      { applicationId },
    );
  }
}
