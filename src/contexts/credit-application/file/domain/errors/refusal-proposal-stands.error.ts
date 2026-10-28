import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class RefusalProposalStands extends DomainRefusal {
  readonly code = CreditApplicationCodes.RefusalProposalStands;

  static forApplication() {
    return RefusalProposalStands.refusal(
      'The review confirmed the proposed refusal: the application can only be refused, not approved.',
    );
  }
}
