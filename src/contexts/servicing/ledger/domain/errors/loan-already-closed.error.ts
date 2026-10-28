import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class LoanAlreadyClosed extends DomainRefusal {
  readonly code = ServicingCodes.LoanAlreadyClosed;

  static forLoan(loanId: string) {
    return LoanAlreadyClosed.refusal('The loan is already closed: its ledger is closed once.', { loanId });
  }
}
