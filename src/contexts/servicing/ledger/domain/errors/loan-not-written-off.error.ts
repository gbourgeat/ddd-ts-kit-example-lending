import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class LoanNotWrittenOff extends DomainRefusal {
  readonly code = ServicingCodes.LoanNotWrittenOff;

  static forLoan(loanId: string) {
    return LoanNotWrittenOff.refusal('The loan is not written off: there is no write-off to reverse.', { loanId });
  }
}
