import { IsEmail, IsIn, IsISO8601, IsString } from 'class-validator';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

export class SearchMembersLine {
  @IsString()
  memberId = '';

  @IsString()
  accountId = '';

  @IsString()
  displayName = '';

  @IsEmail()
  email = '';

  @IsIn(Object.values(MemberRole))
  role = '';

  @IsISO8601()
  joinedAt = '';
}
