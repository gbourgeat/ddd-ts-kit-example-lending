import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchBranchStaffResult,
  SearchBranchStaffSort,
} from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';

/** One page of the staff of a branch, for the branch manager who may see it. */
export class SearchBranchStaffQuery extends AuthorizedQuery<SearchBranchStaffResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<SearchBranchStaffSort>,
    readonly branchId: string,
  ) {
    super(actor);
  }
}
