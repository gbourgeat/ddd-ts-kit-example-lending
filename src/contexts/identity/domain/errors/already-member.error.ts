import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class AlreadyMember extends DomainRefusal {
  readonly code = IdentityCodes.AlreadyMember;

  static forMembership(organisationId: string, accountId: string) {
    return AlreadyMember.refusal(`The account ${accountId} is already a member of ${organisationId}.`, {
      organisationId,
      accountId,
    }).exposing('organisationId', 'accountId');
  }
}
