import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BranchNotOpened } from '@/contexts/branch-network/domain/errors/branch-not-opened.error';

describe('BranchNotOpened', () => {
  it('refuses an appointment to a branch that is not opened, with the code BRANCH_NOT_OPENED', () => {
    const error = BranchNotOpened.forBranch('branch-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('BRANCH_NOT_OPENED');
    expect(error.facts).toEqual({ branchId: 'branch-1' });
  });
});
