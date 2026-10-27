import type { SearchBranchStaffItem } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';
import { InMemorySearchBranchStaffReader } from '@/contexts/branch-network/infrastructure/persistence/in-memory-search-branch-staff.reader';

export class FakeSearchBranchStaffReader extends InMemorySearchBranchStaffReader {
  constructor(protected override readonly branchStaffs: readonly SearchBranchStaffItem[]) {
    super();
  }
}
