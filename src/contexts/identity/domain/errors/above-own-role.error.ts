import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class AboveOwnRole extends DomainRefusal {
  readonly code = IdentityCodes.AboveOwnRole;

  static forOrganisation(organisationId: string) {
    return AboveOwnRole.refusal(
      `A member of ${organisationId} appoints, changes or removes no one above their own role.`,
      { organisationId },
    );
  }
}
