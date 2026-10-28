import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NoAdvisorBranch extends DomainRefusal {
  readonly code = CreditApplicationCodes.NoAdvisorBranch;

  /** No advisor's portfolio holds the applicant, so the application cannot be submitted on a branch. */
  static forApplicant(applicantId: string) {
    return NoAdvisorBranch.refusal('No advisor holds the applicant, so the application has no branch.', {
      applicantId,
    });
  }
}
