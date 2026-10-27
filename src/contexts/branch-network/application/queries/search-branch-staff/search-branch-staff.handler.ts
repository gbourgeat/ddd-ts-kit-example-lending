import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import type { SearchBranchStaffReader } from '@/contexts/branch-network/application/ports/search-branch-staff-reader.port';
import type { SearchBranchStaffQuery } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.query';
import type { SearchBranchStaffResult } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';

export class SearchBranchStaffHandler implements QueryHandler<SearchBranchStaffQuery> {
  constructor(
    private readonly reader: SearchBranchStaffReader,
    private readonly access: Access,
  ) {}

  async execute(query: SearchBranchStaffQuery): Promise<SearchBranchStaffResult> {
    const scope = await this.access.scope(query.actor, branchNetworkPermissions['staff-member.list'], 'staff-member');

    return this.reader.search(scope, query.branchId, query.page);
  }
}
