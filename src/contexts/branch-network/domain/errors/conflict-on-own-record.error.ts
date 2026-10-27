import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';

export class ConflictOnOwnRecord extends DomainRefusal {
  readonly code = BranchNetworkCodes.ConflictOnOwnRecord;

  static forCustomer(customerId: string) {
    return ConflictOnOwnRecord.refusal(
      'A member of staff cannot declare a conflict of interest on their own customer file.',
      { customerId },
    );
  }
}
