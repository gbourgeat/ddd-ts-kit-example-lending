import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';

export class UnknownStaffMember extends DomainRefusal {
  readonly code = BranchNetworkCodes.UnknownStaffMember;

  static forStaffMember(staffMemberId: string) {
    return UnknownStaffMember.refusal('No staff member of the branch network has this identifier.', { staffMemberId });
  }
}
