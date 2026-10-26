import { IsIn } from 'class-validator';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

export class ChangeMemberRoleBody {
  @IsIn(Object.values(MemberRole))
  role: MemberRole = MemberRole.Member;
}
