import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

/** An account became a member of an organisation, in a role. */
export class MemberJoined extends NamedDomainEvent('identity.member.joined') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly facts: {
      readonly organisationId: string;
      readonly accountId: string;
      readonly role: MemberRole;
    },
  ) {
    super();
  }
}
