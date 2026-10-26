import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';

/** Lends some of the rights of the actor in an organisation to another of its members, for a period. */
export class GrantDelegationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly terms: {
      readonly delegateId: string;
      readonly rights: readonly MemberRight[];
      readonly startsAt: Date;
      readonly endsAt: Date;
    },
  ) {
    super(actor);
  }
}
