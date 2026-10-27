import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';

export class FakeStaffMemberRepository extends InMemoryRepository<StaffMember> implements StaffMemberRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: StaffMember) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => StaffMember.rehydrate(id, state),
      }),
    );
  }
}
