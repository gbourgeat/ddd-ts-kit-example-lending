import type { Page } from '@ddd-ts-kit/kernel';

export interface SearchBranchStaffItem {
  readonly id: string;
  readonly branchId: string;
  readonly name: string;
}

/** The fields a client may sort the staff of a branch by: the identifier, the order of the read model. */
export type SearchBranchStaffSort = 'id';

export type SearchBranchStaffResult = Page<SearchBranchStaffItem>;
