import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';

export class BranchNotOpened extends DomainRefusal {
  readonly code = BranchNetworkCodes.BranchNotOpened;

  static forBranch(branchId: string) {
    return BranchNotOpened.refusal('The branch is not opened: its staff cannot be appointed yet.', {
      branchId,
    }).exposing('branchId');
  }
}
