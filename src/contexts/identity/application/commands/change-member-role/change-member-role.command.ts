import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

/** Changes the role of a member of an organisation. */
export class ChangeMemberRoleCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly accountId: string,
    readonly role: MemberRole,
  ) {
    super(actor);
  }
}
