import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';

/** What the assessment answers: the assessment recorded in the file, with the outcome it proposes. */
export interface ApplicationAssessment {
  readonly applicationId: string;
  readonly assessment: CreditApplicationAssessed['assessment'];
}

/** Assesses an application from the account information and the register consultation already in its file, and the score of the scoring model. */
export class AssessApplicationCommand extends AuthorizedCommand<ApplicationAssessment> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
