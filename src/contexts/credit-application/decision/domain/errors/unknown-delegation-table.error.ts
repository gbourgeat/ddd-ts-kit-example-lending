import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownDelegationTable extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownDelegationTable;

  static forUnknownDelegationTable() {
    return UnknownDelegationTable.refusal('Unknown delegation table.');
  }
}
