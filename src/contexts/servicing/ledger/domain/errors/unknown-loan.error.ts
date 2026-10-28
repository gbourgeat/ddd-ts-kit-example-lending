import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class UnknownLoan extends DomainRefusal {
  readonly code = ServicingCodes.UnknownLoan;

  static forLoan(loanId: string) {
    return UnknownLoan.refusal('No loan has this identifier.', { loanId });
  }
}
