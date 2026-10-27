import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownStaffMember } from '@/contexts/branch-network/domain/errors/unknown-staff-member.error';

describe('UnknownStaffMember', () => {
  it('refuses a staff member the branch network does not know, with the code UNKNOWN_STAFF_MEMBER', () => {
    const error = UnknownStaffMember.forStaffMember('staff-member-9');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_STAFF_MEMBER');
  });
});
