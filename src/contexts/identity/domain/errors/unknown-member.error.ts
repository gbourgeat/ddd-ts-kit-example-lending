import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class UnknownMember extends DomainRefusal {
  readonly code = IdentityCodes.UnknownMember;

  static forMembership(organisationId: string, accountId: string) {
    return UnknownMember.refusal(`The account ${accountId} is not a member of ${organisationId}.`, {
      organisationId,
      accountId,
    }).exposing('organisationId', 'accountId');
  }
}
