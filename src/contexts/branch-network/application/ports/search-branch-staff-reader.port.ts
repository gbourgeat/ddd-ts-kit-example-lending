import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchBranchStaffResult,
  SearchBranchStaffSort,
} from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';

export abstract class SearchBranchStaffReader {
  abstract search(
    scope: AccessScope,
    branchId: string,
    page: PageRequest<SearchBranchStaffSort>,
  ): Promise<SearchBranchStaffResult>;
}
