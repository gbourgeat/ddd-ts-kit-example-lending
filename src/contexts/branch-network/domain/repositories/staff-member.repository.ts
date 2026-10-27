import { Repository } from '@ddd-ts-kit/kernel';
import type { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';

export abstract class StaffMemberRepository extends Repository<StaffMember> {}
